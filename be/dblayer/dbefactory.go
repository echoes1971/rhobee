package dblayer

import "log"

type DBEFactory struct {
	verbose        bool
	classname2type map[string]DBEntityInterface
	tablename2type map[string]DBEntityInterface
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
