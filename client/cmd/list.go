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
	listRecursive bool
	listOutput    string
)

var listCmd = &cobra.Command{
	Use:   "list <folder-id>",
	Short: "List folder children",
	Long: `List children of a folder.
	
Examples:
  # List immediate children
  rhobee list folder_id

  # Recursive listing
  rhobee list folder_id --recursive

  # Save to file
  rhobee list folder_id --output children.json`,
	Args: cobra.ExactArgs(1),
	RunE: runList,
}

func init() {
	rootCmd.AddCommand(listCmd)

	listCmd.Flags().BoolVarP(&listRecursive, "recursive", "r", false, "List recursively")
	listCmd.Flags().StringVarP(&listOutput, "output", "o", "", "Output file (default: stdout)")
}

func runList(cmd *cobra.Command, args []string) error {
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

	// Get children
	var allChildren []models.DBObject
	if listRecursive {
		allChildren, err = listRecursiveChildren(client, folderID, 0)
		if err != nil {
			return fmt.Errorf("failed to list children: %w", err)
		}
	} else {
		allChildren, err = client.GetChildren(folderID)
		if err != nil {
			return fmt.Errorf("failed to list children: %w", err)
		}
	}

	// Format output
	output, err := json.MarshalIndent(allChildren, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal children: %w", err)
	}

	// Write output
	if listOutput != "" {
		if err := os.WriteFile(listOutput, output, 0644); err != nil {
			return fmt.Errorf("failed to write file: %w", err)
		}
		fmt.Printf("✓ Found %d objects, saved to %s\n", len(allChildren), listOutput)
	} else {
		fmt.Printf("Found %d objects:\n", len(allChildren))
		fmt.Println(string(output))
	}

	return nil
}

func listRecursiveChildren(client *api.Client, folderID string, depth int) ([]models.DBObject, error) {
	// Safety check: max depth 10
	if depth > 10 {
		return nil, fmt.Errorf("max recursion depth reached (possible cycle)")
	}

	children, err := client.GetChildren(folderID)
	if err != nil {
		return nil, err
	}

	var all []models.DBObject
	for _, child := range children {
		all = append(all, child)

		// If it's a folder, recurse
		if child.Classname == "DBFolder" {
			subChildren, err := listRecursiveChildren(client, child.ID, depth+1)
			if err != nil {
				return nil, err
			}
			all = append(all, subChildren...)
		}
	}

	return all, nil
}
