//-----------------------------------------------
// main entry point
//-----------------------------------------------
import spacetimedb, {init, onConnect, onDisconnect} from './module';


import { upload_image } from './reducers/reducer_image';

//-----------------------------------------------
// 
//-----------------------------------------------
import {
    create_planet_marker,
    update_planet_maker,
    delete_planet_marker,
} from './reducers/reducers_planet';
//-----------------------------------------------
// 
//-----------------------------------------------
import { 
    create_map_tile,
    update_map_tile,
    delete_map_tile,
    create_map_marker,
    update_map_marker,
    delete_map_marker,
} from './reducers/reducers_mapping';
//-----------------------------------------------
// 
//-----------------------------------------------
export {
    // default function
    init,
    onConnect,
    onDisconnect,
    // image
    upload_image,
    // mapping
    create_map_tile,
    update_map_tile,
    delete_map_tile,
    create_map_marker,
    update_map_marker,
    delete_map_marker,
    // planet
    create_planet_marker,
    update_planet_maker,
    delete_planet_marker,
}
//-----------------------------------------------
// 
//-----------------------------------------------
export default spacetimedb;
//-----------------------------------------------
// 
//-----------------------------------------------