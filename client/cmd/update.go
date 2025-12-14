package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/echoes1971/r-prj-ng/client/pkg/api"
	"github.com/echoes1971/r-prj-ng/client/pkg/auth"
	"github.com/echoes1971/r-prj-ng/client/pkg/models"
	"github.com/spf13/cobra"
)

var (
	updateName        string
	updateDescription string
	updatePermissions string
	updateFatherID    string
	updateFile        string
	updateHTML        string
)

var updateCmd = &cobra.Command{
	Use:   "update <object-id>",
	Short: "Update an object",
	Long: `Update an existing object in ρBee.
	
You can update individual fields using flags, or provide a complete JSON file.

Examples:
  # Update name only
  rhobee update abc123 --name "New Name"

  # Update multiple fields
  rhobee update abc123 --name "New Name" --description "Updated description"

  # Update permissions
  rhobee update abc123 --permissions "rwxrwxr--"

  # Move object to different folder
  rhobee update abc123 --father-id new_folder_id

  # Update HTML content (for DBPage)
  rhobee update abc123 --html "<p>New content</p>"

  # Update from JSON file (complete object)
  rhobee update abc123 --file object.json`,
	Args: cobra.ExactArgs(1),
	RunE: runUpdate,
}

func init() {
	rootCmd.AddCommand(updateCmd)

	updateCmd.Flags().StringVar(&updateName, "name", "", "Object name")
	updateCmd.Flags().StringVar(&updateDescription, "description", "", "Object description")
	updateCmd.Flags().StringVar(&updatePermissions, "permissions", "", "Permissions (e.g., rwxrw-r--)")
	updateCmd.Flags().StringVar(&updateFatherID, "father-id", "", "Parent folder ID")
	updateCmd.Flags().StringVar(&updateHTML, "html", "", "HTML content (for DBPage)")
	updateCmd.Flags().StringVar(&updateFile, "file", "", "JSON file with object data")
}

func runUpdate(cmd *cobra.Command, args []string) error {
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

	var obj *models.DBObject

	if updateFile != "" {
		// Load from JSON file
		data, err := os.ReadFile(updateFile)
		if err != nil {
			return fmt.Errorf("failed to read file: %w", err)
		}

		obj = &models.DBObject{}
		if err := json.Unmarshal(data, obj); err != nil {
			return fmt.Errorf("failed to parse JSON: %w", err)
		}

		// Ensure ID is set
		obj.ID = objectID
	} else {
		// Get existing object
		obj, err = client.Get(objectID)
		if err != nil {
			return fmt.Errorf("failed to get object: %w", err)
		}

		// Update fields from flags
		if updateName != "" {
			obj.Name = updateName
		}
		if updateDescription != "" {
			obj.Description = updateDescription
		}
		if updatePermissions != "" {
			obj.Permissions = updatePermissions
		}
		if updateFatherID != "" {
			obj.FatherID = updateFatherID
		}
		if updateHTML != "" {
			obj.HTML = updateHTML
		}

		// Check if any flag was provided
		if updateName == "" && updateDescription == "" && updatePermissions == "" &&
			updateFatherID == "" && updateHTML == "" {
			return fmt.Errorf("no fields to update. Use --name, --description, --permissions, --father-id, --html, or --file")
		}
	}

	// Update object
	if err := client.Update(objectID, obj); err != nil {
		return fmt.Errorf("failed to update object: %w", err)
	}

	fmt.Printf("✓ Updated object: %s\n", obj.Name)
	fmt.Printf("  ID: %s\n", obj.ID)
	fmt.Printf("  Type: %s\n", obj.Classname)
	if obj.Description != "" {
		fmt.Printf("  Description: %s\n", obj.Description)
	}
	fmt.Printf("  Permissions: %s\n", obj.Permissions)

	return nil
}
