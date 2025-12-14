package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "rhobee",
	Short: "ρBee CLI - Command-line interface for ρBee CMS",
	Long: `ρBee CLI is a command-line tool for managing objects in ρBee.
	
It allows you to create, read, update, delete objects, upload/download files,
and migrate content between different ρBee instances.`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().String("instance", "", "Instance name (default: use default_instance from config)")
}
