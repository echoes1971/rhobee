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
	searchType   string
	searchFolder string
	searchOutput string
)

var searchCmd = &cobra.Command{
	Use:   "search <query>",
	Short: "Search for objects",
	Long: `Search for objects by name or description.
	
Examples:
  # Search all objects
  rhobee search "keyword"

  # Search only pages
  rhobee search "keyword" --type DBPage

  # Search in specific folder
  rhobee search "keyword" --folder folder_id

  # Save results to file
  rhobee search "keyword" --output results.json`,
	Args: cobra.ExactArgs(1),
	RunE: runSearch,
}

func init() {
	rootCmd.AddCommand(searchCmd)

	searchCmd.Flags().StringVar(&searchType, "type", "", "Filter by object type (DBPage, DBFolder, DBFile, etc.)")
	searchCmd.Flags().StringVar(&searchFolder, "folder", "", "Search within specific folder")
	searchCmd.Flags().StringVarP(&searchOutput, "output", "o", "", "Output file (default: stdout)")
}

func runSearch(cmd *cobra.Command, args []string) error {
	query := args[0]

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

	// Determine classname
	classname := searchType
	if classname == "" {
		classname = "DBObject" // Search all types
	}

	// Search
	results, err := client.Search(classname, query)
	if err != nil {
		return fmt.Errorf("search failed: %w", err)
	}

	// Filter by folder if specified
	if searchFolder != "" {
		filtered := []models.DBObject{}
		for _, obj := range results {
			if obj.FatherID == searchFolder {
				filtered = append(filtered, obj)
			}
		}
		results = filtered
	}

	// Format output
	output, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal results: %w", err)
	}

	// Write output
	if searchOutput != "" {
		if err := os.WriteFile(searchOutput, output, 0644); err != nil {
			return fmt.Errorf("failed to write file: %w", err)
		}
		fmt.Printf("✓ Found %d objects, saved to %s\n", len(results), searchOutput)
	} else {
		fmt.Printf("Found %d objects:\n", len(results))
		fmt.Println(string(output))
	}

	return nil
}
