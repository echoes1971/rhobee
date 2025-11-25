package dblayer

import (
	"os"
	"path/filepath"
	"testing"
)

func TestMain(m *testing.M) {
	InitDBLayer("mysql", "root:mysecret@tcp(localhost:3306)/rproject", "rprj")

	// Esegui i test
	m.Run()

	// Teardown: chiudi la connessione
	CloseDBConnection()
}

/* ***** Helper functions for tests ***** */

func hardDeleteForTests(repo *DBRepository, object DBObjectInterface) error {
	deletedObject, err := repo.Delete(object)
	if err != nil {
		return err
	}
	// Second time to force the hard delete
	deletedObject, err = repo.Delete(deletedObject)
	if err != nil {
		return err
	}
	return nil
}

// setupTestRepo creates a test repository with standard test context
func setupTestRepo(t *testing.T) *DBRepository {
	dbContext := &DBContext{
		UserID:   "-1",
		GroupIDs: []string{"-2"},
		Schema:   "rprj",
	}
	repo := NewDBRepository(dbContext, Factory, DbConnection)
	repo.Verbose = false
	return repo
}

// prepareTestFile copies a test file from testdata to upload directory
func prepareTestFile(t *testing.T, srcPath, destFilename string) string {
	uploadDir := dbFiles_root_directory + "/" + dbFiles_dest_directory
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		t.Fatalf("Failed to create upload directory: %v", err)
	}

	srcFile, err := os.Open(srcPath)
	if err != nil {
		t.Fatalf("Failed to open test file %s: %v", srcPath, err)
	}
	defer srcFile.Close()

	destPath := filepath.Join(uploadDir, destFilename)
	destFile, err := os.Create(destPath)
	if err != nil {
		t.Fatalf("Failed to create destination file: %v", err)
	}
	defer destFile.Close()

	_, err = destFile.ReadFrom(srcFile)
	if err != nil {
		t.Fatalf("Failed to copy test file: %v", err)
	}

	return destFilename
}

// createTestObject creates an entity with the provided values using repo.CreateObject
// Usage: createTestObject(t, repo, "files", map[string]any{"name": "Test", "filename": "test.jpg"})
func createTestObject(t *testing.T, repo *DBRepository, tableName string, values map[string]any) DBEntityInterface {
	created, err := repo.CreateObject(tableName, values)
	if err != nil {
		t.Fatalf("Failed to create %s: %v", tableName, err)
	}
	return created
}

// createTestFile creates a DBFile with automatic file preparation
// Usage: createTestFile(t, repo, "testdata/images/test.jpg", map[string]any{"name": "Test Image"})
func createTestFile(t *testing.T, repo *DBRepository, srcPath string, values map[string]any) *DBFile {
	// Generate unique filename
	filename := filepath.Base(srcPath)
	prepareTestFile(t, srcPath, filename)

	// Set filename if not provided
	if _, ok := values["filename"]; !ok {
		values["filename"] = filename
	}

	created := createTestObject(t, repo, "files", values)
	return created.(*DBFile)
}

// createTestFolder creates a DBFolder
// Usage: createTestFolder(t, repo, map[string]any{"name": "Test Folder", "fk_obj_id": "-10"})
func createTestFolder(t *testing.T, repo *DBRepository, values map[string]any) DBEntityInterface {
	return createTestObject(t, repo, "folders", values)
}
