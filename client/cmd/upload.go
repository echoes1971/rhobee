package cmd

import (
	"fmt"
	"path/filepath"

	"github.com/echoes1971/r-prj-ng/client/pkg/api"
	"github.com/echoes1971/r-prj-ng/client/pkg/auth"
	"github.com/spf13/cobra"
)

var (
	uploadFolder      string
	uploadName        string
	uploadDescription string
	uploadPermissions string
	uploadNoProgress  bool
)

var uploadCmd = &cobra.Command{
	Use:   "upload <file> [file2] [file3] ...",
	Short: "Upload one or more files",
	Long: `Upload one or more files to ρBee.
	
Examples:
  # Upload single file
  rhobee upload photo.jpg --folder folder_id

  # Upload multiple files
  rhobee upload *.jpg --folder folder_id

  # Upload specific files
  rhobee upload file1.jpg file2.png file3.pdf --folder folder_id

  # Upload with custom description (applies to all files)
  rhobee upload *.pdf --folder folder_id --description "Documents"

  # Upload without progress bar
  rhobee upload large.zip --folder folder_id --no-progress`,
	Args: cobra.MinimumNArgs(1),
	RunE: runUpload,
}

func init() {
	rootCmd.AddCommand(uploadCmd)

	uploadCmd.Flags().StringVar(&uploadFolder, "folder", "", "Parent folder ID (required)")
	uploadCmd.Flags().StringVar(&uploadName, "name", "", "File name (only for single file upload)")
	uploadCmd.Flags().StringVar(&uploadDescription, "description", "", "File description (applies to all files)")
	uploadCmd.Flags().StringVar(&uploadPermissions, "permissions", "rw-r-----", "Permissions (default: rw-r-----)")
	uploadCmd.Flags().BoolVar(&uploadNoProgress, "no-progress", false, "Disable progress bar")

	uploadCmd.MarkFlagRequired("folder")
}

func runUpload(cmd *cobra.Command, args []string) error {
	filePaths := args

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

	showProgress := !uploadNoProgress
	successCount := 0
	failCount := 0

	fmt.Printf("Uploading %d file(s)...\n", len(filePaths))

	for _, filePath := range filePaths {
		// Use filename as name if not specified or uploading multiple files
		name := uploadName
		if name == "" || len(filePaths) > 1 {
			name = filepath.Base(filePath)
		}

		fmt.Printf("\n[%d/%d] Uploading: %s\n", successCount+failCount+1, len(filePaths), name)

		// Upload file
		uploaded, err := client.UploadFile(filePath, uploadFolder, name, uploadDescription, uploadPermissions, showProgress)
		if err != nil {
			fmt.Printf("  ✗ Failed: %v\n", err)
			failCount++
			continue
		}

		fmt.Printf("  ✓ Uploaded successfully (ID: %s)\n", uploaded.ID)
		successCount++
	}

	fmt.Printf("\n")
	fmt.Printf("Summary: %d succeeded, %d failed\n", successCount, failCount)

	if failCount > 0 {
		return fmt.Errorf("%d file(s) failed to upload", failCount)
	}

	return nil
}
