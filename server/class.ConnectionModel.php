<?

	require_once 'config.php';
	require_once 'classes/class.DB.php';
	
	class NeuronModel {
		public static function create($nNeuronId1, $nNeuronId2, $nWeight=1) {
			return DB::insertArray('connections', array(
				'n1_id'		=> $nNeuronId1,
				'n2_id'		=> $nNeuronId2,
				'weight'	=> $nWeight
			));
		}
		
		public static function delete($nId) {
			return DB::deleteById('connections', $nId);
		}
		
		public static function update($nId, $nWeight) {
			return DB::updateArray('connections', array(
				'weight'	=> $nWeight
			));
		}
	}

?>