fetch("small.json")
  .then((res) => res.json())
  .then((gData) => {
    gData.links.forEach((link) => {
      // console.log(gData)
      // console.log(link)
      const a = gData.nodes.find((o) => o.id === link.source);
      const b = gData.nodes.find((o) => o.id === link.target);
      // console.log(link.source)
      // console.log(link.target)
      // console.log(a)
      // console.log(b)
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });
    const NODE_R = 8;
    const highlightNodes = new Set();
    const highlightLinks = new Set();
    let hoverNode = null;

    const elem = document.getElementById("relationshipGraph");

    const Graph = ForceGraph()(document.getElementById("relationshipGraph"))
      .graphData(gData)
      .nodeId("id")
      // .nodeAutoColorBy("group")
      // .nodeRelSize(NODE_R)
      .onNodeHover((node) => {
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
          try {
            highlightNodes.add(node);
            node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
            node.links.forEach((link) => highlightLinks.add(link));
          } catch {
            console.error("empty node error");
          }
        }

        hoverNode = node || null;
        elem.style.cursor = node ? "-webkit-grab" : null;
      })
      .onLinkHover((link) => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (link) {
          highlightLinks.add(link);
          highlightNodes.add(link.source);
          highlightNodes.add(link.target);
        }
      })
      .linkWidth((link) => (highlightLinks.has(link) ? 5 : 1))
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth((link) =>
        highlightLinks.has(link) ? 4 : 0
      )
      .nodeCanvasObject((node, ctx, globalScale) => {
        const label = node.id;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Diatype`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(
          (n) => n + fontSize * 0.2
        ); // some padding

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          ...bckgDimensions
        );
        if (highlightNodes.size !== 0) {
          console.log(highlightNodes);
        }
        // if (highlightNodes.has(node)) {
        // ctx.beginPath();
        // ctx.arc(node.x, node.y, NODE_R * 0.4, 0, 2 * Math.PI, false);
        // ctx.fillStyle = node === hoverNode ? 'red' : 'red';
        // ctx.fill();
        // }

        if (highlightNodes.has(node)) {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "red";
          ctx.fillText(label, node.x, node.y);
        } else {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "blue";
          ctx.fillText(label, node.x, node.y);
        }

        node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
      })
      .nodePointerAreaPaint((node, color, ctx) => {
        ctx.fillStyle = color;
        const bckgDimensions = node.__bckgDimensions;
        bckgDimensions &&
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          );
      });
    Graph.centerAt(425, 600);
    elem.addEventListener("mouseleave", (e) => {
      //   highlightNodes.clear();
      //   highlightLinks.clear();
      Graph.pauseAnimation();
    });
    elem.addEventListener("mouseenter", (e) => {
      Graph.resumeAnimation();
    });
  });
