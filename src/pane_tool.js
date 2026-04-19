

import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { stateBuildSelect, buildTypes, dbMapTiles, PARAMS, stateGrid3DPosition, stateIntersectionPoint, stateIsDrag, statePointer2D, statePointer3D } from './context';
import van from "vanjs-core";

const {div } = van.tags;

// note does not update by THREE.VECTOR3
function setupEditorPane(){
  const pane = new Pane();
  console.log(PARAMS);
  pane.addButton({title:'test'}).on('click',()=>{
    // console.log(statePointer2D.val)
    // console.log(PARAMS.pointer3d)
    console.log(dbMapTiles)
  })

  const cursorFolder = pane.addFolder({title:"Cursor"});

  cursorFolder.addBinding(stateIsDrag,'val',{label:'Is Drag'})

  const cursorPlaneFolder = cursorFolder.addFolder({title:"3D Pointer Plane"});
  // cursorFolder.addBinding(PARAMS, 'pointertd',{ disabled:true, readonly:true });// does not work crash for some reason from  readonly
  cursorPlaneFolder.addBinding(statePointer3D.val, 'x',{ readonly:true });
  cursorPlaneFolder.addBinding(statePointer3D.val, 'y',{ readonly:true });
  cursorPlaneFolder.addBinding(statePointer3D.val, 'z',{ readonly:true });

  const gridPlaneFolder = cursorFolder.addFolder({title:"3D Grid Plane"});
  gridPlaneFolder.addBinding(stateGrid3DPosition.val, 'x',{ readonly:true });
  gridPlaneFolder.addBinding(stateGrid3DPosition.val, 'y',{ readonly:true });
  gridPlaneFolder.addBinding(stateGrid3DPosition.val, 'z',{ readonly:true });
  

  const buildFolder = cursorFolder.addFolder({title:"Build"});
  buildFolder.addBlade({
    view: 'list',
    label: 'Build Type',
    options: buildTypes.val,
    value: 'MARKER',
  }).on('change',(e)=>{
    stateBuildSelect.val = e.value;
  })
  buildFolder.addBinding(stateBuildSelect, 'val', {label:'Select', readonly:true})
}

function UITool(){
  console.log(div);
  return div({style:`position:fixed; top:0px; left:0px;background-color:gray;`},
    "test"
  );
}

function setupSelectPanel(){



  van.add(document.body, UITool())
}


export function setupPane(){
  setupEditorPane();
  setupSelectPanel();
}

