<?

 	class DB extends Object {
		public static $db;
		public static $error;
		/****************************************************************/
		public static function setError($sMessage, $bSoftError=false) {
			DB::$error = "Class DB: ".$sMessage;
			if (!$bSoftError) {
				throw new Exception(DB::$error);
			}
		}
		/****************************************************************/
		public static function isConnected() {
		    return (bool)DB::$db;
	    }
		/****************************************************************/
		public static function connect() {
			if (DB::$db) { return; }
			DB::$db = mysql_connect($_ENV['DB']['HOST'], $_ENV['DB']['USER'], $_ENV['DB']['PASS']);
			if (! DB::$db) {
				DB::setError('Unable to connect: ' . mysql_error());
			}
			if (! mysql_select_db($_ENV['DB']['NAME'], DB::$db)) {
    			DB::setError('Unable to select database: ' . mysql_error());
			}
		}
		/****************************************************************/
		public static function disconnect() {
			if (DB::$db) {
				mysql_close(DB::$db);
				DB::$db = null;
			}
		}
		/****************************************************************/
		public static function select($sQuery) {
		    $bWasConnected = self::isConnected();
		    if (!$bWasConnected) { self::connect(); }

			$oResult = DB::query($sQuery);
			if (!$oResult) { return false; }

			$aRecordSet = array();
			while ($aRow = mysql_fetch_assoc($oResult)) {
				$aRecordSet[] = $aRow;
			}
			mysql_free_result($oResult);

			if (!$bWasConnected) { self::disconnect(); }
			return $aRecordSet;
		}
		/****************************************************************/
		public static function selectColumn($sQuery) {
		    $aResult = self::select($sQuery);
		    $aColumn = array();
		    foreach ($aResult as $aResultCol) {
		        foreach ($aResultCol as $sKey=>$sValue) {
		            $aColumn[] = $aResultCol[$sKey];
		            break;
	            }
	        }
			return $aColumn;
		}
		/****************************************************************/
		public static function update($sQuery) {
		    $bWasConnected = self::isConnected();
		    if (!$bWasConnected) { self::connect(); }

			$oResult = DB::query($sQuery);
			$nAffectedRows = mysql_affected_rows();

			if (!$bWasConnected) { self::disconnect(); }
			return $nAffectedRows;
		}
		/****************************************************************/
		public static function updateArray($sTable, $nId, $aValues, $bSkipEmptyValues=false) {
			if (!$aTableFields = DB::getFieldNames($sTable)) {
				return false;
			}

			if (isset($aValues['create_date'])) { unset($aValues['create_date']); }
			if (isset($aValues['update_date'])) { unset($aValues['update_date']); }

			$sQuery = 'UPDATE `'.$sTable.'` SET ';
			$aPairs = array();
			foreach($aValues as $sKey=>$sVal) {
				if (in_array($sKey, $aTableFields)) {
				    if ($sVal || !$bSkipEmptyValues) {
					    $aPairs[] = '`'.$sKey.'`="'.trim($sVal).'"';
				    }
				}
			}
			if (in_array('update_date', $aTableFields) && !isset($aValues['updated_date']) ) {
				$aPairs[] = 'update_date=NOW()';
			}
			$sQuery .= implode(',', $aPairs);
			$sQuery .= ' WHERE id='.$nId;
			return DB::update($sQuery);
		}
		/****************************************************************/
		public static function insert($sQuery) {
		    $bWasConnected = self::isConnected();
		    if (!$bWasConnected) { self::connect(); }

			$oResult = DB::query($sQuery);
			if (!$oResult) { return false; }

            $nInsertId = mysql_insert_id(DB::$db);

            if (!$bWasConnected) { self::disconnect(); }
            return $nInsertId;
		}
		/****************************************************************/
		public static function insertArray($sTable, $aValues) {
			if (!$aTableFields = DB::getFieldNames($sTable)) {
				return false;
			}

			if (isset($aValues['create_date'])) { unset($aValues['create_date']); }
			if (isset($aValues['update_date'])) { unset($aValues['update_date']); }

			$aPairs = array();
			foreach($aValues as $sKey=>$sVal) {
				if (in_array($sKey, $aTableFields)) {
					$aPairs[] = '`'.$sKey.'`="'.trim($sVal).'"';
				}
			}
			if (in_array('create_date', $aTableFields) && !isset($aValues['created_date']) ) {
				$aPairs[] = 'create_date=NOW()';
			}
			if (in_array('update_date', $aTableFields) && !isset($aValues['updated_date']) ) {
				$aPairs[] = 'update_date=NOW()';
			}
		    $sQuery = 'INSERT INTO `'.$sTable.'`';
			if (count($aPairs) > 0) {
			    $sQuery .= ' SET '.implode(',', $aPairs);
		    }
		    return DB::insert($sQuery);
		}
		/****************************************************************/
		public static function getId($sTable, $sWhere) {
			$sQuery = 'SELECT id FROM `'.$sTable.'` WHERE '.$sWhere;
			$oResult = DB::select($sQuery);
			return isset($oResult[0]) ? $oResult[0]['id'] : 0;
		}
		/****************************************************************/
		public static function query($sQuery, $bSoftError=false) {
		    $bWasConnected = self::isConnected();
		    if (!$bWasConnected) { self::connect(); }

            //Debug::log($sQuery);

			DB::$error = null;
			if (!DB::$db) {
				DB::setError('Not connected to database', $bSoftError);
				return false;
			}
			$oResult = mysql_query($sQuery, DB::$db);
			if (!$oResult) {
    			DB::setError(mysql_error().' QUERY: '.Dom::pre($sQuery, $bSoftError));
			}

			if (!$bWasConnected) { self::disconnect(); }
			return $oResult;
		}
		/****************************************************************/
		public static function deleteWhere($sTable, $sWhere) {
		    DB::connect();
            $oResult = DB::query("DELETE FROM `$sTable` WHERE $sWhere");
            $nAffectedRows = mysql_affected_rows();
	        DB::disconnect();
            return $nAffectedRows;
		}
		/****************************************************************/
		public static function deleteById($sTable, $nId) {
			return self::deleteWhere($sTable, 'id='.$nId);
		}
		/****************************************************************/
		public static function getFieldNames($sTable) {
			$aFields = DB::select('SHOW COLUMNS FROM '.$sTable);
			$aFieldNames = array();
			foreach($aFields as $aField) {
				$aFieldNames[] = $aField['Field'];
			}
			return $aFieldNames;
		}
		/****************************************************************/
		public static function makeWhereEqAndClause($aValues) {
			$aPairs = array();
			foreach($aValues as $sKey=>$sVal) {
				$aPairs[] = $sKey.'=\''.trim($sVal).'\'';
			}
			return implode (' AND ', $aPairs);
		}
		/****************************************************************/
		public static function makeWhereEqOrClause($aKeys) {
			$aPairs = array();
			foreach($aKeys as $sVal=>$sKey) {
				$aPairs[] = $sKey.'=\''.trim($sVal).'\'';
			}
			return implode (' OR ', $aPairs);
		}
		/****************************************************************/
		public static function countRecords($sTable) {
		    DB::connect();
	        $oResult = DB::select('SELECT count(id) AS n FROM `'.$sTable.'` WHERE 1');
	        DB::disconnect();
	        return isset($oResult[0]) ? $oResult[0]['n'] : 0;
	    }
	    /****************************************************************/
	    public static function sanitize(&$mData) {
	        if (is_array($mData)) {
				$aSanitizedData = array();
				foreach ($mData as $sKey=>$sData) {
					self::sanitize($sKey);
					self::sanitize($sData);
					$aSanitizedData[$sKey] = $sData;
				}
				$mData = $aSanitizedData;
			} else if (!is_object($mData)) {
			    if (self::isConnected()) {
				    $mData = mysql_real_escape_string($mData);
				} else {
				    self::connect();
				    $mData = mysql_real_escape_string($mData);
				    self::disconnect();
			    }
			} else {
			    self::setError('Dont know how to sanitize '.gettype($mData));
		    }
	    }
	    /****************************************************************/
	}

?>
