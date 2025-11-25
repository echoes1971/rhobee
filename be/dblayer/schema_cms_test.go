package dblayer

import (
	"log"
	"testing"
)

func TestDBFolderDefaultValues(t *testing.T) {
	// Setup
	dbContext := &DBContext{
		UserID:   "-1",
		GroupIDs: []string{"-2"},
		Schema:   "rprj",
	}

	fk_obj_id_value := "-10"

	repo := NewDBRepository(dbContext, Factory, DbConnection)
	repo.Verbose = false

	// Create parent folder
	parentFolder := repo.GetInstanceByTableName("folders")
	if parentFolder == nil {
		t.Fatal("Failed to create DBFolder instance")
	}
	parentFolder.SetValue("name", "Parent Folder")
	parentFolder.SetValue("fk_obj_id", fk_obj_id_value)
	repo.Verbose = true
	createdParent, err := repo.Insert(parentFolder)
	repo.Verbose = false
	if err != nil {
		t.Fatalf("Failed to create parent folder: %v", err)
	}
	log.Print("Created parent folder: ", createdParent.ToString())

	if createdParent.GetValue("fk_obj_id") != fk_obj_id_value {
		err := hardDeleteForTests(repo, createdParent.(DBObjectInterface))
		if err != nil {
			t.Fatalf("Failed to hard delete parent folder: %v", err)
		}
		t.Fatalf("Expected fk_obj_id to be '%s', got '%v'", fk_obj_id_value, createdParent.GetValue("fk_obj_id"))
	}

	// Create child folder without setting some fields
	childFolder := repo.GetInstanceByTableName("folders").(DBObjectInterface)
	if childFolder == nil {
		t.Fatal("Failed to create DBFolder instance")
	}
	childFolder.SetValue("name", "Child Folder")
	childFolder.SetValue("father_id", createdParent.GetValue("id"))

	repo.Verbose = false
	childFolder.SetDefaultValues(repo)
	repo.Verbose = false

	log.Print("Child folder after SetDefaultValues: ", childFolder.ToString())

	log.Print("Parent folder.fk_obj_id: ", createdParent.GetValue("fk_obj_id"))
	log.Print(" Child folder.fk_obj_id: ", childFolder.GetValue("fk_obj_id"))

	// Verify default values
	if childFolder.GetValue("fk_obj_id") != createdParent.GetValue("fk_obj_id") {
		t.Fatalf("Expected fk_obj_id to be '%v', got '%v'", createdParent.GetValue("fk_obj_id"), childFolder.GetValue("fk_obj_id"))
	}

	// Optionally, insert the child folder to verify no errors occur
	// createdChild, err := repo.Insert(childFolder)

	// Delete parent folder
	err = hardDeleteForTests(repo, createdParent.(DBObjectInterface))
	if err != nil {
		t.Fatalf("Failed to hard delete parent folder: %v", err)
	}
}
