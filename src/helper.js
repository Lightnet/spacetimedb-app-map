

// Define a function named degrees_to_radians that converts degrees to radians.
export function degrees_to_radians(degrees){
  // Store the value of pi.
  var pi = Math.PI;
  // Multiply degrees by pi divided by 180 to convert to radians.
  return degrees * (pi/180);
}
// note has to be entityID checks
export function addOrUpdateEntity( state, ent) {
  if (!ent || !ent.entityId) return;
  const newMap = new Map(state.val);           // get current and create copy
  newMap.set(ent.entityId, ent);
  state.val = newMap;                  // assign new Map → triggers update
}
// note has to be entityID checks
export function deleteEntity(state,id) {
  if (!id) return;
  // Create new Map without the item
  const newMap = new Map(state.val);
  newMap.delete(id);
  // Update the state (this is what makes VanJS detect the change)
  state.val = newMap;
}