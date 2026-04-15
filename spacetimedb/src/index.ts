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
} from './reducers/reducer_planet';
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
} from './reducers/reducer_mapping';

import { 
    create_icon,
    update_icon,
    delete_icon,
} from './reducers/reducer_entity'

import {
    call_test
} from './reducers/reducer_test'

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
    // entity
    // mapping
    create_map_tile,
    update_map_tile,
    delete_map_tile,
    create_map_marker,
    update_map_marker,
    delete_map_marker,
    create_icon,
    update_icon,
    delete_icon,
    // planet
    create_planet_marker,
    update_planet_maker,
    delete_planet_marker,
    // test
    call_test
}
//-----------------------------------------------
// 
//-----------------------------------------------
export default spacetimedb;
//-----------------------------------------------
// 
//-----------------------------------------------