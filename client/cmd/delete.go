package cmd

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/echoes1971/r-prj-ng/client/pkg/api"
	"github.com/echoes1971/r-prj-ng/client/pkg/auth"
	"github.com/spf13/cobra"
)

var deleteForce bool

var deleteCmd = &cobra.Command{
	Use:   "delete <object-id>",
	Short: "Delete an object",
	Long: `Delete an object from ρBee.
	
Examples:
  # Delete with confirmation
  rhobee delete object_id

  # Delete without confirmation
  rhobee delete object_id --force`,
	Args: cobra.ExactArgs(1),
	RunE: runDelete,
}

func init() {
	rootCmd.AddCommand(deleteCmd)

	deleteCmd.Flags().BoolVarP(&deleteForce, "force", "f", false, "Skip confirmation prompt")
}

func runDelete(cmd *cobra.Command, args []string) error {
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

	// Get object details first (to show what we're deleting)
	obj, err := client.Get(objectID)
	if err != nil {
		return fmt.Errorf("failed to get object: %w", err)
	}

	// Confirm deletion unless --force
	if !deleteForce {
		fmt.Printf("Delete %s \"%s\" (ID: %s)?\n", obj.Classname, obj.Name, obj.ID)
		fmt.Print("Type 'yes' to confirm: ")

		reader := bufio.NewReader(os.Stdin)
		response, err := reader.ReadString('\n')
		if err != nil {
			return fmt.Errorf("failed to read confirmation: %w", err)
		}

		response = strings.TrimSpace(strings.ToLower(response))
		if response != "yes" {
			fmt.Println("Deletion cancelled")
			return nil
		}
	}

	// Delete object
	if err := client.Delete(objectID); err != nil {
		return fmt.Errorf("failed to delete object: %w", err)
	}

	fmt.Printf("✓ Deleted %s \"%s\"\n", obj.Classname, obj.Name)

	return nil
}
