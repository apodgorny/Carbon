<?

	require_once 'config.php';
	require_once 'classes/class.DB.php';
	
	class NeuronModel {
		public static function create($nBias) {
			return DB::insertArray('neurons', array(
				'bias'	=> $nBias
			));
		}
		
		public static function delete($nId) {
			return DB::deleteById('neurons', $nId);
		}
		
		public static function update($nId, $nBias) {
			return DB::updateArray('neurons', $nId, array(
				'bias'	=> $nBias
			));
		}
	}

?>