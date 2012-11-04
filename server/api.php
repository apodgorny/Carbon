<?

	require_once 'class.NeuronModel.php';
	require_once 'class.ConnectionModel.php';

	$a = json_decode($_REQUEST['q'], 1);
	$sFunction 	= $a['function'];
	$aArguments	= $a['arguments'];
	
	$Api = array(
		
		'create_neuron' 	=> function($nBias) {
			return NeuronModel::create($nBias);
		},
		'delete_neuron'	=> function($nId) {
			return NeuronModel::delete($nId);
		},
		'update_neuron'	=> function($nId, $nBias) {
			return NeuronModel::update($nId, $nBias);
		},
		
		'create_connection'	=> function($nId1, $nId2, $nWeight=1) {
			return ConnectionModel::create($nId1, $nId2, $nWeight);
		},
		'delete_connection'	=> function($nId) {
			return ConnectionModel::delete($nId);
		},
		'update_connection'	=> function($nId, $nWeight) {
			return ConnectionModel::update($nId, $nWeight);
		}
	}

	
?>