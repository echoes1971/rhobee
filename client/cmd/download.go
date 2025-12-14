package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/echoes1971/r-prj-ng/client/pkg/api"
	"github.com/echoes1971/r-prj-ng/client/pkg/auth"
	"github.com/spf13/cobra"
)

var (
	downloadOutput     string
	downloadNoProgress bool
)

var downloadCmd = &cobra.Command{
	Use:   "download <object-id>",
	Short: "Download a file by object ID",
	Long: `Download a file from ρBee by its object ID.
	
Examples:
  # Download file to current directory (uses original filename)
  rhobee download abc123def456

  # Download file with custom output path
  rhobee download abc123def456 --output /path/to/myfile.pdf

  # Download without progress bar
  rhobee download abc123def456 --no-progress`,
	Args: cobra.ExactArgs(1),
	RunE: runDownload,
}

func init() {
	rootCmd.AddCommand(downloadCmd)

	downloadCmd.Flags().StringVarP(&downloadOutput, "output", "o", "", "Output file path (default: current directory with original filename)")
	downloadCmd.Flags().BoolVar(&downloadNoProgress, "no-progress", false, "Disable progress bar")
}

func runDownload(cmd *cobra.Command, args []string) error {
	objectID := args[0]

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

	// Get object metadata to find filename
	obj, err := client.Get(objectID)
	if err != nil {
		return fmt.Errorf("failed to get object metadata: %w", err)
	}

	if obj.Classname != "DBFile" {
		return fmt.Errorf("object %s is not a file (type: %s)", objectID, obj.Classname)
	}

	// Determine output path
	outputPath := downloadOutput
	if outputPath == "" {
		// Use original filename in current directory
		if obj.Filename != "" {
			outputPath = filepath.Base(obj.Filename)
		} else if obj.Name != "" {
			outputPath = obj.Name
		} else {
			outputPath = objectID
		}
	}

	// Check if output path is a directory
	if info, err := os.Stat(outputPath); err == nil && info.IsDir() {
		// It's a directory, use original filename
		filename := filepath.Base(obj.Filename)
		if filename == "" {
			filename = obj.Name
		}
		outputPath = filepath.Join(outputPath, filename)
	}

	fmt.Printf("Downloading: %s\n", obj.Name)
	fmt.Printf("  ID: %s\n", obj.ID)
	fmt.Printf("  Type: %s\n", obj.Mime)
	fmt.Printf("  Output: %s\n", outputPath)

	// Download file
	showProgress := !downloadNoProgress
	if err := client.DownloadFile(obj.ID, outputPath, showProgress); err != nil {
		return fmt.Errorf("failed to download file: %w", err)
	}

	fmt.Printf("✓ Downloaded successfully\n")

	return nil
}
