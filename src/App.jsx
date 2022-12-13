import "./styles.css";
import Seo from './modules/Seo.jsx';
import NodeCanvas from "./modules/NodeCanvas";
import NodeSVG from "./modules/NodeSVG";
import projects from "./assets/projects.json";
import useWindowDimensions from "./modules/useWindowDimentions";


let nodes = [];
let links = [];
let tagArray = [];

nodes.push({"id" : "Sylvia Ke", "type": "root"})

projects.info.forEach(project => {
    nodes.push({"id" : project.title, "type": "project"});
    links.push({"source": project.title, "target": "Sylvia Ke", "type": "p2r"});
    project.tags.forEach(tag => {
      let i = tagArray.findIndex(element => element.tag == tag);
      if(i == -1){
        // nodes.push({"id" : tag, "type": "tag"});
        // links.push({"source": tag, "target": "Sylvia Ke", "type": "t2r"});
        tagArray.push({"tag" : tag, "children" : [project.title]});
      }
      else{
        tagArray[i].children.push(project.title);
      }
      // links.push({"source": project.title, "target": tag, "type": "p2t"})
    });
}); 

tagArray.forEach(tag => {
  for (let i = 0 ; i < tag.children.length; i++){
    for (let j = i + 1; j < tag.children.length; j++){
      links.push({"source": tag.children[i], "target": tag.children[j], "type": "p2p"});
    }
  }
});

// console.log(nodes);
// console.log(links);
// console.log(tagArray);

const data = {"nodes":nodes, "links":links};

function App() {
  const { width, height } = useWindowDimensions();

  const dimensions = {
    width: width,
    height: height,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  };

  return (
      <div className="App">
        <Seo />
        <main role="main" className="wrapper">
            <div className="content-svg" z-index = "3">
              <NodeSVG data = {data} dimensions= {dimensions}/>
            </div>
        </main>
      </div>
  )
}

export default App
