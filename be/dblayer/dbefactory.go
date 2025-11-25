package dblayer

import (
	"log"
	"slices"
)

type DBEFactory struct {
	verbose        bool
	classname2type map[string]DBEntityInterface
	tablename2type map[string]DBEntityInterface

	TableChildren map[string][]string
}

func NewDBEFactory(verbose bool) *DBEFactory {
	ret := &DBEFactory{
		verbose: verbose,
	}
	ret.classname2type = make(map[string]DBEntityInterface)
	ret.tablename2type = make(map[string]DBEntityInterface)

	return ret
}

func (dbef *DBEFactory) Register(dbe DBEntityInterface) {
	if dbef.verbose {
		log.Print("DBEFactory::Registering DBEntity: ", dbe.GetTypeName(), " -> ", dbe.GetTableName())
	}
	dbef.classname2type[dbe.GetTypeName()] = dbe
	dbef.tablename2type[dbe.GetTableName()] = dbe

	if dbef.TableChildren == nil {
		dbef.TableChildren = make(map[string][]string)
	}
	if !dbe.IsDBObject() {
		return
	}
	for _, fk := range dbe.GetForeignKeys() {
		parentTable := fk.RefTable
		parentInstance := dbef.GetInstanceByTableName(parentTable)
		if parentInstance == nil || !parentInstance.IsDBObject() {
			continue
		}
		if _, exists := dbef.TableChildren[parentTable]; !exists {
			dbef.TableChildren[parentTable] = make([]string, 0)
		}
		childTableName := dbe.GetTableName()
		// Use slices.Contains to check if childTableName exists
		if slices.Contains(dbef.TableChildren[parentTable], childTableName) {
			continue
		}
		dbef.TableChildren[parentTable] = append(dbef.TableChildren[parentTable], childTableName)
	}
}

func (dbef *DBEFactory) GetAllClassNames() []string {
	ret := make([]string, 0, len(dbef.classname2type))
	for className := range dbef.classname2type {
		ret = append(ret, className)
	}
	return ret
}

func (dbef *DBEFactory) GetInstanceByClassName(className string) DBEntityInterface {
	if dbeType, exists := dbef.classname2type[className]; exists {
		return dbeType.NewInstance()
	}
	return nil
}

func (dbef *DBEFactory) GetInstanceByTableName(tableName string) DBEntityInterface {
	if dbeType, exists := dbef.tablename2type[tableName]; exists {
		return dbeType.NewInstance()
	}
	return nil
}

// GetInstanceByTableNameWithValues creates a new instance and sets the provided values
// Usage: factory.GetInstanceByTableNameWithValues("files", map[string]any{"name": "Test", "filename": "test.jpg"})
func (dbef *DBEFactory) GetInstanceByTableNameWithValues(tableName string, values map[string]any) DBEntityInterface {
	instance := dbef.GetInstanceByTableName(tableName)
	if instance == nil {
		return nil
	}
	for key, value := range values {
		instance.SetValue(key, value)
	}
	return instance
}
