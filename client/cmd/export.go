package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/echoes1971/r-prj-ng/client/pkg/api"
	"github.com/echoes1971/r-prj-ng/client/pkg/auth"
	"github.com/spf13/cobra"
)

var exportOutput string

var exportCmd = &cobra.Command{
	Use:   "export <folder-id>",
	Short: "Export a folder and its contents",
	Long: `Export a folder recursively with all children and files.
	
Creates a directory structure:
  manifest.json    - Export metadata
  objects/         - Object JSON files
  files/           - Downloaded files

Examples:
  # Export folder
  rhobee export folder_id --output ./backup/

  # Export root
  rhobee export 0 --output ./backup/`,
	Args: cobra.ExactArgs(1),
	RunE: runExport,
}

func init() {
	rootCmd.AddCommand(exportCmd)

	exportCmd.Flags().StringVarP(&exportOutput, "output", "o", "", "Output directory (required)")
	exportCmd.MarkFlagRequired("output")
}

type ExportManifest struct {
	Version      string             `json:"version"`
	ExportedAt   string             `json:"exported_at"`
	SourceURL    string             `json:"source_url"`
	RootID       string             `json:"root_object_id"`
	TotalObjects int                `json:"total_objects"`
	TotalFiles   int                `json:"total_files"`
	Objects      []ExportObjectInfo `json:"objects"`
}

type ExportObjectInfo struct {
	ID       string   `json:"id"`
	Type     string   `json:"type"`
	Name     string   `json:"name"`
	Path     string   `json:"path"`
	Children []string `json:"children,omitempty"`
	FilePath string   `json:"file_path,omitempty"`
}

func runExport(cmd *cobra.Command, args []string) error {
	folderID := args[0]

	// Get token
	tokenManager, err := auth.NewTokenManager()
	if err != nil {
		return fmt.Errorf("failed to create token manager: %w", err)
	}

	instance, _ := cmd.Flags().GetString("instance")
	url, _, token, err := tokenManager.GetToken(instance)
	if err != nil {
		return fmt.Errorf("not logged in. Run 'rhobee login' first: %w", err)
	}

	// Create API client
	client := api.NewClient(url, token)

	// Create output directories
	if err := os.MkdirAll(filepath.Join(exportOutput, "objects"), 0755); err != nil {
		return fmt.Errorf("failed to create objects directory: %w", err)
	}
	if err := os.MkdirAll(filepath.Join(exportOutput, "files"), 0755); err != nil {
		return fmt.Errorf("failed to create files directory: %w", err)
	}

	fmt.Printf("Exporting folder %s...\n", folderID)

	// Export recursively
	manifest := ExportManifest{
		Version:   "1.0",
		SourceURL: url,
		RootID:    folderID,
		Objects:   []ExportObjectInfo{},
	}

	visitedIDs := make(map[string]bool)
	if err := exportObject(client, folderID, &manifest, visitedIDs, 0); err != nil {
		return fmt.Errorf("export failed: %w", err)
	}

	// Count files
	fileCount := 0
	for _, obj := range manifest.Objects {
		if obj.Type == "DBFile" {
			fileCount++
		}
	}
	manifest.TotalObjects = len(manifest.Objects)
	manifest.TotalFiles = fileCount

	// Save manifest
	manifestData, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal manifest: %w", err)
	}
	if err := os.WriteFile(filepath.Join(exportOutput, "manifest.json"), manifestData, 0644); err != nil {
		return fmt.Errorf("failed to write manifest: %w", err)
	}

	fmt.Printf("✓ Exported %d objects (%d files) to %s\n", manifest.TotalObjects, manifest.TotalFiles, exportOutput)

	return nil
}

func exportObject(client *api.Client, objectID string, manifest *ExportManifest, visited map[string]bool, depth int) error {
	// Prevent cycles and deep recursion
	if depth > 20 {
		return fmt.Errorf("max recursion depth reached (possible cycle)")
	}
	if visited[objectID] {
		return nil // Already exported
	}
	visited[objectID] = true

	// Get object
	obj, err := client.Get(objectID)
	if err != nil {
		return fmt.Errorf("failed to get object %s: %w", objectID, err)
	}

	fmt.Printf("  Exporting %s: %s\n", obj.Classname, obj.Name)

	// Save object JSON
	objPath := filepath.Join("objects", objectID+".json")
	objData, err := json.MarshalIndent(obj, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal object: %w", err)
	}
	if err := os.WriteFile(filepath.Join(exportOutput, objPath), objData, 0644); err != nil {
		return fmt.Errorf("failed to write object file: %w", err)
	}

	// Add to manifest
	objInfo := ExportObjectInfo{
		ID:   obj.ID,
		Type: obj.Classname,
		Name: obj.Name,
		Path: objPath,
	}

	// Download file if DBFile
	if obj.Classname == "DBFile" && obj.Filename != "" {
		filePath := filepath.Join("files", obj.ID+"_"+filepath.Base(obj.Filename))
		fullPath := filepath.Join(exportOutput, filePath)

		fmt.Printf("    Downloading file: %s\n", obj.Filename)
		if err := client.DownloadFile(obj.ID, fullPath, false); err != nil {
			fmt.Printf("    Warning: failed to download file: %v\n", err)
		} else {
			objInfo.FilePath = filePath
		}
	}

	// Export children if folder
	if obj.Classname == "DBFolder" {
		// Get regular children (excludes index pages)
		children, err := client.GetChildren(obj.ID)
		if err != nil {
			return fmt.Errorf("failed to get children of %s: %w", obj.ID, err)
		}

		// Also search for index page specifically (need searchJson to get father_id)
		indexPages, err := client.SearchWithAllFields("DBPage", "index")
		if err == nil {
			for _, page := range indexPages {
				if page.FatherID == obj.ID && page.Name == "index" {
					children = append(children, page)
					break
				}
			}
		}

		fmt.Printf("    Found %d children\n", len(children))
		for _, child := range children {
			objInfo.Children = append(objInfo.Children, child.ID)
			if err := exportObject(client, child.ID, manifest, visited, depth+1); err != nil {
				return err
			}
		}
	}

	manifest.Objects = append(manifest.Objects, objInfo)

	return nil
}
