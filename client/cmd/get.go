package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/echoes1971/r-prj-ng/client/pkg/api"
	"github.com/echoes1971/r-prj-ng/client/pkg/auth"
	"github.com/spf13/cobra"
)

var getOutput string

var getCmd = &cobra.Command{
	Use:   "get <object-id>",
	Short: "Get an object by ID",
	Long: `Retrieve an object from ρBee by its ID.
	
Examples:
  # Print to stdout
  rhobee get c123abc456

  # Save to file
  rhobee get c123abc456 --output page.json`,
	Args: cobra.ExactArgs(1),
	RunE: runGet,
}

func init() {
	rootCmd.AddCommand(getCmd)

	getCmd.Flags().StringVarP(&getOutput, "output", "o", "", "Output file (default: stdout)")
}

func runGet(cmd *cobra.Command, args []string) error {
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

	// Get object
	obj, err := client.Get(objectID)
	if err != nil {
		return fmt.Errorf("failed to get object: %w", err)
	}

	// Format output
	output, err := json.MarshalIndent(obj, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal object: %w", err)
	}

	// Write output
	if getOutput != "" {
		if err := os.WriteFile(getOutput, output, 0644); err != nil {
			return fmt.Errorf("failed to write file: %w", err)
		}
		fmt.Printf("✓ Saved to %s\n", getOutput)
	} else {
		fmt.Println(string(output))
	}

	return nil
}
