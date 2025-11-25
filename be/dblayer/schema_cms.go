package dblayer

import (
	"database/sql"
	"log"
)

/*
CREATE TABLE IF NOT EXISTS `rra_events` (

	`id` varchar(16) NOT NULL DEFAULT '',
	`owner` varchar(16) NOT NULL DEFAULT '',
	`group_id` varchar(16) NOT NULL DEFAULT '',
	`permissions` varchar(9) NOT NULL DEFAULT 'rwx------',
	`creator` varchar(16) NOT NULL DEFAULT '',
	`creation_date` datetime DEFAULT NULL,
	`last_modify` varchar(16) NOT NULL DEFAULT '',
	`last_modify_date` datetime DEFAULT NULL,
	`deleted_by` varchar(16) DEFAULT NULL,
	`deleted_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	`father_id` varchar(16) DEFAULT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`description` text,
	`fk_obj_id` varchar(16) DEFAULT NULL,
	`start_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	`end_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	`all_day` char(1) NOT NULL DEFAULT '1',
	`url` varchar(255) DEFAULT NULL,
	`alarm` char(1) DEFAULT '0',
	`alarm_minute` int(11) DEFAULT '0',
	`alarm_unit` char(1) DEFAULT '0',
	`before_event` char(1) DEFAULT '0',
	`category` varchar(255) DEFAULT '',
	`recurrence` char(1) DEFAULT '0',
	`recurrence_type` char(1) DEFAULT '0',
	`daily_every_x` int(11) DEFAULT '0',
	`weekly_every_x` int(11) DEFAULT '0',
	`weekly_day_of_the_week` char(1) DEFAULT '0',
	`monthly_every_x` int(11) DEFAULT '0',
	`monthly_day_of_the_month` int(11) DEFAULT '0',
	`monthly_week_number` int(11) DEFAULT '0',
	`monthly_week_day` char(1) DEFAULT '0',
	`yearly_month_number` int(11) DEFAULT '0',
	`yearly_month_day` int(11) DEFAULT '0',
	`yearly_week_number` int(11) DEFAULT '0',
	`yearly_week_day` char(1) DEFAULT '0',
	`yearly_day_of_the_year` int(11) DEFAULT '0',
	`recurrence_times` int(11) DEFAULT '0',
	`recurrence_end_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	PRIMARY KEY (`id`),
	KEY `rra_events_0` (`id`),
	KEY `rra_events_1` (`owner`),
	KEY `rra_events_2` (`group_id`),
	KEY `rra_events_3` (`creator`),
	KEY `rra_events_4` (`last_modify`),
	KEY `rra_events_5` (`deleted_by`),
	KEY `rra_events_6` (`father_id`),
	KEY `rra_events_7` (`fk_obj_id`),
	KEY `rra_events_8` (`fk_obj_id`),
	KEY `rra_events_9` (`fk_obj_id`),
	KEY `rra_events_10` (`fk_obj_id`),
	KEY `rra_events_idx2` (`start_date`),
	KEY `rra_events_idx3` (`end_date`)

) ENGINE=MyISAM DEFAULT CHARSET=latin1;
*/
type DBEvent struct {
	DBObject
}

func NewDBEvent() *DBEvent {
	columns := []Column{
		{Name: "id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "owner", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "group_id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "permissions", Type: "varchar(9)", Constraints: []string{"NOT NULL"}},
		{Name: "creator", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "creation_date", Type: "datetime", Constraints: []string{}},
		{Name: "last_modify", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "last_modify_date", Type: "datetime", Constraints: []string{}},
		{Name: "deleted_by", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_date", Type: "datetime", Constraints: []string{}},
		{Name: "father_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "name", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "description", Type: "text", Constraints: []string{}},
		{Name: "fk_obj_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "start_date", Type: "datetime", Constraints: []string{"NOT NULL"}},
		{Name: "end_date", Type: "datetime", Constraints: []string{"NOT NULL"}},
		{Name: "all_day", Type: "char(1)", Constraints: []string{"NOT NULL"}},
		{Name: "url", Type: "varchar(255)", Constraints: []string{}},
		{Name: "alarm", Type: "char(1)", Constraints: []string{}},
		{Name: "alarm_minute", Type: "int(11)", Constraints: []string{}},
		{Name: "alarm_unit", Type: "char(1)", Constraints: []string{}},
		{Name: "before_event", Type: "char(1)", Constraints: []string{}},
		{Name: "category", Type: "varchar(255)", Constraints: []string{}},
		{Name: "recurrence", Type: "char(1)", Constraints: []string{}},
		{Name: "recurrence_type", Type: "char(1)", Constraints: []string{}},
		{Name: "daily_every_x", Type: "int(11)", Constraints: []string{}},
		{Name: "weekly_every_x", Type: "int(11)", Constraints: []string{}},
		{Name: "weekly_day_of_the_week", Type: "char(1)", Constraints: []string{}},
		{Name: "monthly_every_x", Type: "int(11)", Constraints: []string{}},
		{Name: "monthly_day_of_the_month", Type: "int(11)", Constraints: []string{}},
		{Name: "monthly_week_number", Type: "int(11)", Constraints: []string{}},
		{Name: "monthly_week_day", Type: "char(1)", Constraints: []string{}},
		{Name: "yearly_month_number", Type: "int(11)", Constraints: []string{}},
		{Name: "yearly_month_day", Type: "int(11)", Constraints: []string{}},
		{Name: "yearly_week_number", Type: "int(11)", Constraints: []string{}},
		{Name: "yearly_week_day", Type: "char(1)", Constraints: []string{}},
		{Name: "yearly_day_of_the_year", Type: "int(11)", Constraints: []string{}},
		{Name: "recurrence_times", Type: "int(11)", Constraints: []string{}},
		{Name: "recurrence_end_date", Type: "datetime", Constraints: []string{"NOT NULL"}},
	}
	keys := []string{"id"}
	foreignKeys := []ForeignKey{
		{Column: "owner", RefTable: "users", RefColumn: "id"},
		{Column: "group_id", RefTable: "groups", RefColumn: "id"},
		{Column: "creator", RefTable: "users", RefColumn: "id"},
		{Column: "last_modify", RefTable: "users", RefColumn: "id"},
		{Column: "deleted_by", RefTable: "users", RefColumn: "id"},

		{Column: "fk_obj_id", RefTable: "companies", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "folders", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "people", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "projects", RefColumn: "id"},
	}
	return &DBEvent{
		DBObject: DBObject{
			DBEntity: *NewDBEntity(
				"DBEvent",
				"events",
				columns,
				keys,
				foreignKeys,
				make(map[string]any),
			),
		},
	}
}
func (dbEvent *DBEvent) NewInstance() DBEntityInterface {
	return NewDBEvent()
}

/*
CREATE TABLE IF NOT EXISTS `rra_files` (

	`id` varchar(16) NOT NULL DEFAULT '',
	`owner` varchar(16) NOT NULL DEFAULT '',
	`group_id` varchar(16) NOT NULL DEFAULT '',
	`permissions` varchar(9) NOT NULL DEFAULT 'rwx------',
	`creator` varchar(16) NOT NULL DEFAULT '',
	`creation_date` datetime DEFAULT NULL,
	`last_modify` varchar(16) NOT NULL DEFAULT '',
	`last_modify_date` datetime DEFAULT NULL,
	`father_id` varchar(16) DEFAULT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`description` text,
	`fk_obj_id` varchar(16) DEFAULT NULL,
	`path` text,
	`filename` text NOT NULL,
	`checksum` varchar(40) DEFAULT NULL,
	`mime` varchar(255) DEFAULT NULL,
	`alt_link` varchar(255) NOT NULL DEFAULT '',
	`deleted_by` varchar(16) DEFAULT NULL,
	`deleted_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	PRIMARY KEY (`id`),
	KEY `rra_files_idx1` (`id`),
	KEY `rra_files_idx2` (`owner`),
	KEY `rra_files_idx3` (`name`),
	KEY `rra_files_idx4` (`creator`),
	KEY `rra_files_idx5` (`last_modify`)

) ENGINE=MyISAM DEFAULT CHARSET=latin1;
*/
type DBFile struct {
	DBObject
}

func NewDBFile() *DBFile {
	columns := []Column{
		{Name: "id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "owner", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "group_id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "permissions", Type: "varchar(9)", Constraints: []string{"NOT NULL"}},
		{Name: "creator", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "creation_date", Type: "datetime", Constraints: []string{}},
		{Name: "last_modify", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "last_modify_date", Type: "datetime", Constraints: []string{}},
		{Name: "father_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "name", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "description", Type: "text", Constraints: []string{}},
		{Name: "fk_obj_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "path", Type: "text", Constraints: []string{}},
		{Name: "filename", Type: "text", Constraints: []string{"NOT NULL"}},
		{Name: "checksum", Type: "varchar(40)", Constraints: []string{}},
		{Name: "mime", Type: "varchar(255)", Constraints: []string{}},
		{Name: "alt_link", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "deleted_by", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_date", Type: "datetime", Constraints: []string{}},
	}
	keys := []string{"id"}
	foreignKeys := []ForeignKey{
		{Column: "owner", RefTable: "users", RefColumn: "id"},
		{Column: "group_id", RefTable: "groups", RefColumn: "id"},
		{Column: "creator", RefTable: "users", RefColumn: "id"},
		{Column: "last_modify", RefTable: "users", RefColumn: "id"},
		{Column: "deleted_by", RefTable: "users", RefColumn: "id"},
		{Column: "father_id", RefTable: "folders", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "pages", RefColumn: "id"},
		{Column: "father_id", RefTable: "pages", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "news", RefColumn: "id"},
		{Column: "father_id", RefTable: "news", RefColumn: "id"},
	}
	return &DBFile{
		DBObject: DBObject{
			DBEntity: *NewDBEntity(
				"DBFile",
				"files",
				columns,
				keys,
				foreignKeys,
				make(map[string]any),
			),
		},
	}
}
func (dbFile *DBFile) NewInstance() DBEntityInterface {
	return NewDBFile()
}

func (dbFile *DBFile) GetOrderBy() []string {
	return []string{"path", "filename"}
}

// function generaFilename($aId=null, $aFilename=null) {
// 	$nomefile = $aFilename==null?$this->getValue('filename'):$aFilename;
// 	$id=$aId==null?$this->getValue('id'):$aId;
// 	$prefisso = 'r_'.$id.'_';
// 	if(strpos($nomefile,$prefisso)!==false)
// 		$nomefile=str_replace($prefisso,"",$nomefile);
// 	return $prefisso.$nomefile;
// }
// function generaObjectPath($a_dbe=null) {
// 	$_dbe = $a_dbe!=null ? $a_dbe : $this;
// 	$dest_path = $_dbe->getValue('path')>'' ? $_dbe->getValue('path') : '';
// 	$father_id = $_dbe->getValue('father_id');
// 	if($father_id>0) $dest_path = $father_id.($dest_path>''?'/':'').$dest_path;
// 	return $dest_path;
// }
// function getFullpath($a_dbe=null) {
// 	$mydbe = $a_dbe!=null ? $a_dbe : $this;
// 	$dest_path = $mydbe->generaObjectPath();
// 	$dest_dir=realpath($GLOBALS['root_directory'].'/'.$mydbe->dest_directory);
// 	if($dest_path>'') $dest_dir.="/$dest_path";
// 	$ret = "$dest_dir/".$mydbe->getValue('filename');
// 	return $ret;
// }
// // Image management: start.
// function getThumbnailFilename() { return $this->getValue('filename')."_thumb.jpg"; }
// function isImage() { $_mime = $this->getValue('mime'); return $_mime>'' && substr($_mime,0,5)=='image'; }
// function createThumbnail($fullpath, $pix_width=100,$pix_height=100) {
// 	$gis = getimagesize($fullpath);
// 	$type = $gis[2];
// 	$imorig=null;
// 		if(!function_exists('imagecreatefromjpeg')) {
// 			echo "<h1>";
// 			echo "RUN:<br/>";
// 			echo "sudo aptitude install php5-gd</br>";
// 			echo "sudo /etc/init.d/apache2 restart<br/>";
// 			echo "</h1>";
// 		}
// 	switch($type) {
// 		case "1": $imorig = imagecreatefromgif($fullpath); break;
// 		case "2": $imorig = imagecreatefromjpeg($fullpath);break;
// 		case "3": $imorig = imagecreatefrompng($fullpath); break;
// 		default:  $imorig = imagecreatefromjpeg($fullpath);
// 	}
// 	$w = imagesx($imorig);
// 	$h = imagesy($imorig);
// 	$max_pixel = $w>$h ? $w : $h;
// 	$scale = $max_pixel / ($w>$h ? $pix_width : $pix_height);
// 	$pix_width = intval($w / $scale);
// 	$pix_height = intval($h / $scale);
// 	$im = imagecreatetruecolor($pix_width,$pix_height);
// 	if(imagecopyresampled($im,$imorig , 0,0,0,0,$pix_width,$pix_height,$w,$h)) {
// 		if(imagejpeg($im, $fullpath."_thumb.jpg")) {
// 			return $fullpath."_thumb.jpg";
// 		}
// 	}
// 	return "";
// }
// function deleteThumbnail($fullpath) {
// 	unlink($fullpath."_thumb.jpg");
// }
// // Image management: end.
// function _before_insert(&$dbmgr) {
// 	parent::_before_insert($dbmgr);
// 	// Eredita la 'radice' dal padre
// 	$father_id = $this->getValue('father_id');
// 	if($father_id>0) {
// 		$query="select fk_obj_id from ". $dbmgr->buildTableName($this)." where id='".DBEntity::uuid2hex($this->getValue('father_id'))."'";
// 		$tmp = $dbmgr->select("DBE",$this->getTableName(),$query);
// 		if(count($tmp)==1) {
// 			$this->setValue('fk_obj_id', $tmp[0]->getValue('fk_obj_id'));
// 		}
// 	}
// 	// Aggiungo il prefisso al nome del file
// 	if($this->getValue('filename')>'') {
// 		$dest_path = $this->generaObjectPath();
// 		$from_dir=realpath($GLOBALS['root_directory'].'/'.$this->dest_directory);
// 		$dest_dir=realpath($GLOBALS['root_directory'].'/'.$this->dest_directory);
// 		if($dest_path>'') $dest_dir.="/$dest_path";
// 		if(!file_exists($dest_dir)) mkdir($dest_dir, 0755);
// 		// con basename() ottengo solo il nome del file senza il path relativo nel quale e' stato caricato
// 		$nuovo_filename = $this->generaFilename($this->getValue('id'), basename($this->getValue('filename')));
// 		rename($from_dir."/".$this->getValue('filename'), $dest_dir."/".$nuovo_filename);
// 		if(!($this->getValue('name')>'')) $this->setValue('name',basename($this->getValue('filename')));
// 		$this->setValue('filename', $nuovo_filename);
// 	}
// 	// Checksum
// 	$_fullpath = $this->getFullpath();
// 	if(file_exists($_fullpath)) {
// 		$newchecksum = sha1_file($_fullpath);
// 		$this->setValue('checksum',$newchecksum);
// 	} else {
// 		$this->setValue('checksum',"File '".$this->getValue('filename')."' not found!");
// 	}
// 	// Mime type
// 	if(file_exists($_fullpath)) {
// 		if(function_exists('finfo_open')) {
// 			$finfo = finfo_open(FILEINFO_MIME);
// 			if(!$finfo) {
// 				if(function_exists('mime_content_type'))
// 					$this->setValue('mime',mime_content_type($_fullpath));
// 				else
// 					$this->setValue('mime','text/plain');
// 				return;
// 			}
// 			$this->setValue('mime',finfo_file($finfo,$_fullpath));
// 			finfo_close($finfo);
// 		} elseif(function_exists('mime_content_type'))
// 			$this->setValue('mime',mime_content_type($_fullpath));
// 		else
// 			$this->setValue('mime','text/plain');
// 	} else {
// 		$this->setValue('mime','text/plain');
// 	}
// 	// Image
// 	if($this->isImage())
// 		$this->createThumbnail($_fullpath);
// }
// function _before_update(&$dbmgr) {
// 	parent::_before_update($dbmgr);
// 	// Eredita la 'radice' dal padre
// 	$father_id = $this->getValue('father_id');
// 	if($father_id>0) {
// 		$query="select fk_obj_id from ". $dbmgr->buildTableName($this)." where id='".DBEntity::uuid2hex($this->getValue('father_id'))."'";
// 		$tmp = $dbmgr->select("DBE",$this->getTableName(),$query);
// 		if(count($tmp)==1) {
// 			$this->setValue('fk_obj_id', $tmp[0]->getValue('fk_obj_id'));
// 		}
// 	}
// 	// Controllo se ho già un file salvato
// 	eval("\$cerca = new ".get_class($this)."();");
// 	$cerca->setValue('id', $this->getValue('id'));
// 	$tmp=$dbmgr->search($cerca,$uselike=0);
// 	$myself=$tmp[0];
// 	if($this->getValue('filename')>'' && $myself->getValue('filename')!=$this->getValue('filename')) {
// 		// Filename diversi ==> elimino il vecchio
// 		$dest_path = $myself->generaObjectPath();
// 		$dest_dir=realpath($GLOBALS['root_directory'].'/'.$this->dest_directory);
// 		if($dest_path>'') $dest_dir.="/$dest_path";
// 		$dest_file = $dest_dir."/".$myself->generaFilename();
// 		if(!file_exists($dest_file)) {
// 			// Do nothing
// 		} else {
// 			unlink($dest_file);
// 			// Image
// 			if($this->isImage())
// 				$this->deleteThumbnail($dest_file);
// 		}
// 	}
// 	// Aggiungo il prefisso al nome del file
// 	if($this->getValue('filename')>'') {
// 		$from_dir=realpath($GLOBALS['root_directory'].'/'.$this->dest_directory);
// 		$dest_path = $this->generaObjectPath();
// 		$dest_dir=realpath($GLOBALS['root_directory'].'/'.$this->dest_directory);
// 		if($dest_path>'') $dest_dir.="/$dest_path";
// 		if(!file_exists($dest_dir)) mkdir($dest_dir, 0755);
// 		$nuovo_filename = $this->generaFilename($this->getValue('id'), basename($this->getValue('filename')));
// 		rename("$from_dir/".$this->getValue('filename'),"$dest_dir/$nuovo_filename");
// 		$this->setValue('filename', $nuovo_filename);
// 	} else if($myself->getValue('path')!=$this->getValue('path')) {
// 		$from_path = $myself->generaObjectPath();
// 		$from_dir=realpath($GLOBALS['root_directory'].'/'.$this->dest_directory);
// 		if($from_path>'') $from_dir.="/$from_path";
// 		$dest_path = $this->generaObjectPath();
// 		$dest_dir=realpath($GLOBALS['root_directory'].'/'.$this->dest_directory);
// 		if($dest_path>'') $dest_dir.="/$dest_path";
// 		if(!file_exists($dest_dir)) mkdir($dest_dir, 0755);
// 		rename("$from_dir/".$myself->getValue('filename'),"$dest_dir/".$myself->getValue('filename'));
// 		// TODO controllare se funziona
// 		$this->setValue('filename', $myself->getValue('filename'));
// 	} else {
// 		// TODO controllare se funziona
// 		$this->setValue('filename', $myself->getValue('filename'));
// 	}
// 	// Checksum
// 	$_fullpath = $this->getFullpath();
// 	if(file_exists($_fullpath)) {
// 		$newchecksum = sha1_file($_fullpath);
// 		$this->setValue('checksum',$newchecksum);
// 	} else {
// 		$this->setValue('checksum',"File '".$this->getValue('filename')."' not found!");
// 	}
// 	// Mime type
// 	if(file_exists($_fullpath)) {
// 		if(function_exists('finfo_open')) {
// 			$finfo = finfo_open(FILEINFO_MIME);
// 			if(!$finfo) {
// 				if(function_exists('mime_content_type'))
// 					$this->setValue('mime',mime_content_type($_fullpath));
// 				else
// 					$this->setValue('mime','text/plain');
// 				return;
// 			}
// 			$this->setValue('mime',finfo_file($finfo,$_fullpath));
// 			finfo_close($finfo);
// 		} elseif(function_exists('mime_content_type'))
// 			$this->setValue('mime',mime_content_type($_fullpath));
// 		else
// 			$this->setValue('mime','text/plain');
// 	} else {
// 		$this->setValue('mime','text/plain');
// 	}
// 	// Image
// 	if($this->isImage())
// 		$this->createThumbnail($_fullpath);
// }
// function _before_delete(&$dbmgr) {
// 	// Has it been marked deleted before?
// 	$is_deleted = $this->isDeleted();
// 	parent::_before_delete($dbmgr);
// 	// If it has been marked deleted, then now is a REAL delete, so remove the file
// 	if($is_deleted) {
// 		// Controllo se ho già un file salvato
// 		$cerca = new DBEFile();
// 		$cerca->setValue('id', $this->getValue('id'));
// 		// BUGFIX 2012.04.04: start.
// 		$tmp=$dbmgr->search($cerca,0,false,null,false);
// // 			$tmp=$dbmgr->search($cerca,$uselike=0);
// 		// BUGFIX 2012.04.04: end.
// 		if(count($tmp)>0) {
// 			$myself=$tmp[0];
// 			if($myself->getValue('filename')>'') {
// 				// ==> elimino il file
// 				$dest_path = $myself->generaObjectPath();
// 				$dest_dir=realpath($GLOBALS['root_directory'].'/'.$this->dest_directory);
// 				if($dest_path>'') $dest_dir.="/$dest_path";
// 				unlink($dest_dir."/".$myself->generaFilename());
// 				// Image
// 				if($this->isImage())
// 					$this->deleteThumbnail($dest_dir."/".$myself->generaFilename());
// 			}
// 		}
// 	}
// }

/*
CREATE TABLE IF NOT EXISTS `rra_folders` (

	`id` varchar(16) NOT NULL DEFAULT '',
	`owner` varchar(16) NOT NULL DEFAULT '',
	`group_id` varchar(16) NOT NULL DEFAULT '',
	`permissions` varchar(9) NOT NULL DEFAULT 'rwx------',
	`creator` varchar(16) NOT NULL DEFAULT '',
	`creation_date` datetime DEFAULT NULL,
	`last_modify` varchar(16) NOT NULL DEFAULT '',
	`last_modify_date` datetime DEFAULT NULL,
	`father_id` varchar(16) DEFAULT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`description` text,
	`fk_obj_id` varchar(16) DEFAULT NULL,
	`childs_sort_order` text,
	`deleted_by` varchar(16) DEFAULT NULL,
	`deleted_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	PRIMARY KEY (`id`),
	KEY `rra_folders_idx1` (`id`),
	KEY `rra_folders_idx2` (`owner`),
	KEY `rra_folders_idx3` (`name`),
	KEY `rra_folders_idx4` (`creator`),
	KEY `rra_folders_idx5` (`last_modify`)

) ENGINE=MyISAM DEFAULT CHARSET=latin1;
*/
type DBFolder struct {
	DBObject
}

func NewDBFolder() *DBFolder {
	columns := []Column{
		{Name: "id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "owner", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "group_id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "permissions", Type: "varchar(9)", Constraints: []string{"NOT NULL"}},
		{Name: "creator", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "creation_date", Type: "datetime", Constraints: []string{}},
		{Name: "last_modify", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "last_modify_date", Type: "datetime", Constraints: []string{}},
		{Name: "deleted_by", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_date", Type: "datetime", Constraints: []string{}},
		{Name: "father_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "name", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "description", Type: "text", Constraints: []string{}},
		{Name: "fk_obj_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "childs_sort_order", Type: "text", Constraints: []string{}},
	}
	keys := []string{"id"}
	foreignKeys := []ForeignKey{
		{Column: "owner", RefTable: "users", RefColumn: "id"},
		{Column: "group_id", RefTable: "groups", RefColumn: "id"},
		{Column: "creator", RefTable: "users", RefColumn: "id"},
		{Column: "last_modify", RefTable: "users", RefColumn: "id"},
		{Column: "deleted_by", RefTable: "users", RefColumn: "id"},
		{Column: "father_id", RefTable: "objects", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "companies", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "people", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "projects", RefColumn: "id"},
	}
	return &DBFolder{
		DBObject: DBObject{
			DBEntity: *NewDBEntity(
				"DBFolder",
				"folders",
				columns,
				keys,
				foreignKeys,
				make(map[string]any),
			),
		},
	}
}
func (dbFolder *DBFolder) NewInstance() DBEntityInterface {
	return NewDBFolder()
}
func (dbFolder *DBFolder) IsDBObject() bool {
	return true
}

func (dbFolder *DBFolder) SetDefaultValues(repo *DBRepository) {
	if repo.Verbose {
		log.Print("DBFolder.SetDefaultValues called")
	}
	dbFolder.DBObject.SetDefaultValues(repo)

	if !dbFolder.HasValue("father_id") || dbFolder.GetValue("father_id") == "" || dbFolder.GetValue("father_id") == "0" {
		return
	}
	father := repo.GetEntityByID("folders", dbFolder.GetValue("father_id").(string))
	if father != nil {
		if fatherFolder, ok := father.(*DBFolder); ok {
			if fatherFolder.HasValue("fk_obj_id") && fatherFolder.GetValue("fk_obj_id") != "" && fatherFolder.GetValue("fk_obj_id") != "0" {
				dbFolder.SetValue("fk_obj_id", fatherFolder.GetValue("fk_obj_id"))
			}
		}
	}
}

func (dbFolder *DBFolder) beforeInsert(dbr *DBRepository, tx *sql.Tx) error {
	if dbr.Verbose {
		log.Print("DBFolder.beforeInsert called")
	}
	err := dbFolder.DBObject.beforeInsert(dbr, tx)
	if err != nil {
		return err
	}
	// This seems redundant with SetDefaultValues, but keeping it for compatibility
	// I don't know, it seems to hide the effects of SetDefaultValues... maybe it should be removed?
	if !dbFolder.HasValue("father_id") || dbFolder.GetValue("father_id") == "" || dbFolder.GetValue("father_id") == "0" {
		return nil
	}
	father := dbr.GetEntityByIDWithTx("folders", dbFolder.GetValue("father_id").(string), tx)
	if father != nil {
		if fatherFolder, ok := father.(*DBFolder); ok {
			if fatherFolder.HasValue("fk_obj_id") && fatherFolder.GetValue("fk_obj_id") != "" && fatherFolder.GetValue("fk_obj_id") != "0" {
				dbFolder.SetValue("fk_obj_id", fatherFolder.GetValue("fk_obj_id"))
			}
		}
	}
	return nil
}

func (dbFolder *DBFolder) beforeUpdate(dbr *DBRepository, tx *sql.Tx) error {
	if dbr.Verbose {
		log.Print("DBFolder.beforeUpdate called")
	}
	err := dbFolder.DBObject.beforeUpdate(dbr, tx)
	if err != nil {
		return err
	}
	// This seems redundant with SetDefaultValues, but keeping it for compatibility
	// I don't know, it seems to hide the effects of SetDefaultValues... maybe it should be removed?
	if !dbFolder.HasValue("father_id") || dbFolder.GetValue("father_id") == "" || dbFolder.GetValue("father_id") == "0" {
		return nil
	}
	father := dbr.GetEntityByIDWithTx("folders", dbFolder.GetValue("father_id").(string), tx)
	if father != nil {
		if fatherFolder, ok := father.(*DBFolder); ok {
			if fatherFolder.HasValue("fk_obj_id") && fatherFolder.GetValue("fk_obj_id") != "" && fatherFolder.GetValue("fk_obj_id") != "0" {
				dbFolder.SetValue("fk_obj_id", fatherFolder.GetValue("fk_obj_id"))
			}
		}
	}
	return nil
}

/*
CREATE TABLE IF NOT EXISTS `rra_links` (

	`id` varchar(16) NOT NULL DEFAULT '',
	`owner` varchar(16) NOT NULL DEFAULT '',
	`group_id` varchar(16) NOT NULL DEFAULT '',
	`permissions` varchar(9) NOT NULL DEFAULT 'rwx------',
	`creator` varchar(16) NOT NULL DEFAULT '',
	`creation_date` datetime DEFAULT NULL,
	`last_modify` varchar(16) NOT NULL DEFAULT '',
	`last_modify_date` datetime DEFAULT NULL,
	`father_id` varchar(16) DEFAULT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`description` text,
	`href` varchar(255) NOT NULL DEFAULT '',
	`target` varchar(255) DEFAULT '_blank',
	`fk_obj_id` varchar(16) DEFAULT NULL,
	`deleted_by` varchar(16) DEFAULT NULL,
	`deleted_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	PRIMARY KEY (`id`),
	KEY `rra_links_idx1` (`id`),
	KEY `rra_links_idx2` (`owner`),
	KEY `rra_links_idx3` (`name`),
	KEY `rra_links_idx4` (`creator`),
	KEY `rra_links_idx5` (`last_modify`),
	KEY `rra_links_idx6` (`father_id`)

) ENGINE=MyISAM DEFAULT CHARSET=latin1;
*/
type DBLink struct {
	DBObject
}

func NewDBLink() *DBLink {
	columns := []Column{
		{Name: "id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "owner", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "group_id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "permissions", Type: "varchar(9)", Constraints: []string{"NOT NULL"}},
		{Name: "creator", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "creation_date", Type: "datetime", Constraints: []string{}},
		{Name: "last_modify", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "last_modify_date", Type: "datetime", Constraints: []string{}},
		{Name: "father_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "name", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "description", Type: "text", Constraints: []string{}},
		{Name: "href", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "target", Type: "varchar(255)", Constraints: []string{}},
		{Name: "fk_obj_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_by", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_date", Type: "datetime", Constraints: []string{}},
	}
	keys := []string{"id"}

	foreignKeys := []ForeignKey{
		{Column: "owner", RefTable: "users", RefColumn: "id"},
		{Column: "group_id", RefTable: "groups", RefColumn: "id"},
		{Column: "creator", RefTable: "users", RefColumn: "id"},
		{Column: "last_modify", RefTable: "users", RefColumn: "id"},
		{Column: "deleted_by", RefTable: "users", RefColumn: "id"},
		{Column: "father_id", RefTable: "pages", RefColumn: "id"},
		{Column: "father_id", RefTable: "news", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "companies", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "folders", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "people", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "projects", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "pages", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "news", RefColumn: "id"},
	}
	return &DBLink{
		DBObject: DBObject{
			DBEntity: *NewDBEntity(
				"DBLink",
				"links",
				columns,
				keys,
				foreignKeys,
				make(map[string]any),
			),
		},
	}
}
func (dbLink *DBLink) NewInstance() DBEntityInterface {
	return NewDBLink()
}

/*
CREATE TABLE IF NOT EXISTS `rra_notes` (

	`id` varchar(16) NOT NULL DEFAULT '',
	`owner` varchar(16) NOT NULL DEFAULT '',
	`group_id` varchar(16) NOT NULL DEFAULT '',
	`permissions` varchar(9) NOT NULL DEFAULT 'rwx------',
	`creator` varchar(16) NOT NULL DEFAULT '',
	`creation_date` datetime DEFAULT NULL,
	`last_modify` varchar(16) NOT NULL DEFAULT '',
	`last_modify_date` datetime DEFAULT NULL,
	`father_id` varchar(16) DEFAULT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`description` text,
	`fk_obj_id` varchar(16) DEFAULT NULL,
	`deleted_by` varchar(16) DEFAULT NULL,
	`deleted_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	PRIMARY KEY (`id`),
	KEY `rra_notes_idx1` (`id`),
	KEY `rra_notes_idx2` (`owner`),
	KEY `rra_notes_idx3` (`name`),
	KEY `rra_notes_idx4` (`creator`),
	KEY `rra_notes_idx5` (`last_modify`),
	KEY `rra_pages_idx1` (`id`),
	KEY `rra_pages_idx2` (`owner`),
	KEY `rra_pages_idx3` (`name`),
	KEY `rra_pages_idx4` (`creator`),
	KEY `rra_pages_idx5` (`last_modify`)

) ENGINE=MyISAM DEFAULT CHARSET=latin1;
*/
type DBNote struct {
	DBObject
}

func NewDBNote() *DBNote {
	columns := []Column{
		{Name: "id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "owner", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "group_id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "permissions", Type: "varchar(9)", Constraints: []string{"NOT NULL"}},
		{Name: "creator", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "creation_date", Type: "datetime", Constraints: []string{}},
		{Name: "last_modify", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "last_modify_date", Type: "datetime", Constraints: []string{}},
		{Name: "father_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "name", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "description", Type: "text", Constraints: []string{}},
		{Name: "fk_obj_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_by", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_date", Type: "datetime", Constraints: []string{}},
	}
	keys := []string{"id"}

	foreignKeys := []ForeignKey{
		{Column: "owner", RefTable: "users", RefColumn: "id"},
		{Column: "group_id", RefTable: "groups", RefColumn: "id"},
		{Column: "creator", RefTable: "users", RefColumn: "id"},
		{Column: "last_modify", RefTable: "users", RefColumn: "id"},
		{Column: "deleted_by", RefTable: "users", RefColumn: "id"},
		{Column: "father_id", RefTable: "objects", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "companies", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "folders", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "people", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "projects", RefColumn: "id"},
	}
	return &DBNote{
		DBObject: DBObject{
			DBEntity: *NewDBEntity(
				"DBNote",
				"notes",
				columns,
				keys,
				foreignKeys,
				make(map[string]any),
			),
		},
	}
}
func (dbNote *DBNote) NewInstance() DBEntityInterface {
	return NewDBNote()
}

/*
CREATE TABLE IF NOT EXISTS `rra_pages` (

	`id` varchar(16) NOT NULL DEFAULT '',
	`owner` varchar(16) NOT NULL DEFAULT '',
	`group_id` varchar(16) NOT NULL DEFAULT '',
	`permissions` varchar(9) NOT NULL DEFAULT 'rwx------',
	`creator` varchar(16) NOT NULL DEFAULT '',
	`creation_date` datetime DEFAULT NULL,
	`last_modify` varchar(16) NOT NULL DEFAULT '',
	`last_modify_date` datetime DEFAULT NULL,
	`father_id` varchar(16) DEFAULT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`description` text,
	`html` text,
	`fk_obj_id` varchar(16) DEFAULT NULL,
	`language` varchar(5) DEFAULT 'en_us',
	`deleted_by` varchar(16) DEFAULT NULL,
	`deleted_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	PRIMARY KEY (`id`)

) ENGINE=MyISAM DEFAULT CHARSET=latin1;
*/
type DBPage struct {
	DBObject
}

func NewDBPage() *DBPage {
	columns := []Column{
		{Name: "id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "owner", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "group_id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "permissions", Type: "varchar(9)", Constraints: []string{"NOT NULL"}},
		{Name: "creator", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "creation_date", Type: "datetime", Constraints: []string{}},
		{Name: "last_modify", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "last_modify_date", Type: "datetime", Constraints: []string{}},
		{Name: "father_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "name", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "description", Type: "text", Constraints: []string{}},
		{Name: "html", Type: "text", Constraints: []string{}},
		{Name: "fk_obj_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "language", Type: "varchar(5)", Constraints: []string{}},
		{Name: "deleted_by", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_date", Type: "datetime", Constraints: []string{}},
	}
	keys := []string{"id"}

	foreignKeys := []ForeignKey{
		{Column: "owner", RefTable: "users", RefColumn: "id"},
		{Column: "group_id", RefTable: "groups", RefColumn: "id"},
		{Column: "creator", RefTable: "users", RefColumn: "id"},
		{Column: "last_modify", RefTable: "users", RefColumn: "id"},
		{Column: "deleted_by", RefTable: "users", RefColumn: "id"},
		{Column: "father_id", RefTable: "objects", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "companies", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "folders", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "people", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "projects", RefColumn: "id"},
	}
	return &DBPage{
		DBObject: DBObject{
			DBEntity: *NewDBEntity(
				"DBPage",
				"pages",
				columns,
				keys,
				foreignKeys,
				make(map[string]any),
			),
		},
	}
}
func (dbPage *DBPage) NewInstance() DBEntityInterface {
	return NewDBPage()
}

/*
CREATE TABLE IF NOT EXISTS `rra_news` (

	`id` varchar(16) NOT NULL DEFAULT '',
	`owner` varchar(16) NOT NULL DEFAULT '',
	`group_id` varchar(16) NOT NULL DEFAULT '',
	`permissions` varchar(9) NOT NULL DEFAULT 'rwx------',
	`creator` varchar(16) NOT NULL DEFAULT '',
	`creation_date` datetime DEFAULT NULL,
	`last_modify` varchar(16) NOT NULL DEFAULT '',
	`last_modify_date` datetime DEFAULT NULL,
	`father_id` varchar(16) DEFAULT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`description` text,
	`html` text,
	`fk_obj_id` varchar(16) DEFAULT NULL,
	`language` varchar(5) DEFAULT 'en_us',
	`deleted_by` varchar(16) DEFAULT NULL,
	`deleted_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
	PRIMARY KEY (`id`),
	KEY `rra_news_0` (`id`),
	KEY `rra_news_1` (`owner`),
	KEY `rra_news_2` (`group_id`),
	KEY `rra_news_3` (`creator`),
	KEY `rra_news_4` (`last_modify`),
	KEY `rra_news_5` (`father_id`),
	KEY `rra_news_6` (`fk_obj_id`),
	KEY `rra_news_7` (`fk_obj_id`),
	KEY `rra_news_8` (`fk_obj_id`),
	KEY `rra_news_9` (`fk_obj_id`)

) ENGINE=MyISAM DEFAULT CHARSET=latin1;
*/
type DBNews struct {
	DBObject
}

func NewDBNews() *DBNews {
	columns := []Column{
		{Name: "id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "owner", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "group_id", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "permissions", Type: "varchar(9)", Constraints: []string{"NOT NULL"}},
		{Name: "creator", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "creation_date", Type: "datetime", Constraints: []string{}},
		{Name: "last_modify", Type: "varchar(16)", Constraints: []string{"NOT NULL"}},
		{Name: "last_modify_date", Type: "datetime", Constraints: []string{}},
		{Name: "deleted_by", Type: "varchar(16)", Constraints: []string{}},
		{Name: "deleted_date", Type: "datetime", Constraints: []string{}},
		{Name: "father_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "name", Type: "varchar(255)", Constraints: []string{"NOT NULL"}},
		{Name: "description", Type: "text", Constraints: []string{}},
		{Name: "html", Type: "text", Constraints: []string{}},
		{Name: "fk_obj_id", Type: "varchar(16)", Constraints: []string{}},
		{Name: "language", Type: "varchar(5)", Constraints: []string{}},
	}
	keys := []string{"id"}

	foreignKeys := []ForeignKey{
		{Column: "owner", RefTable: "users", RefColumn: "id"},
		{Column: "group_id", RefTable: "groups", RefColumn: "id"},
		{Column: "creator", RefTable: "users", RefColumn: "id"},
		{Column: "last_modify", RefTable: "users", RefColumn: "id"},
		{Column: "deleted_by", RefTable: "users", RefColumn: "id"},
		{Column: "father_id", RefTable: "objects", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "companies", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "folders", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "people", RefColumn: "id"},
		{Column: "fk_obj_id", RefTable: "projects", RefColumn: "id"},
	}
	return &DBNews{
		DBObject: DBObject{
			DBEntity: *NewDBEntity(
				"DBNews",
				"news",
				columns,
				keys,
				foreignKeys,
				make(map[string]any),
			),
		},
	}
}
func (dbNews *DBNews) NewInstance() DBEntityInterface {
	return NewDBNews()
}
