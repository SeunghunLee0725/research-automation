import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Slider, FormControlLabel, Switch } from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';

interface CoauthorData {
  authors: string[];
  collaborations: number;
}

interface NetworkNode {
  id: string;
  name: string;
  size: number;
  color: string;
  collaborations?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  value: number;
  color: string;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

interface CoauthorNetworkGraphProps {
  data: CoauthorData[];
  width?: number;
  height?: number;
}

const CoauthorNetworkGraph: React.FC<CoauthorNetworkGraphProps> = ({ 
  data, 
  width = 800, 
  height = 600 
}) => {
  const fgRef = useRef<any>();
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], links: [] });
  const [linkDistance, setLinkDistance] = useState(100);
  const [showLabels, setShowLabels] = useState(true);
  const [nodeSize, setNodeSize] = useState(5);

  useEffect(() => {
    if (!data || data.length === 0) {
      setNetworkData({ nodes: [], links: [] });
      return;
    }

    // Create nodes and links from coauthor data
    const nodeMap = new Map<string, NetworkNode>();
    const links: NetworkLink[] = [];

    // Process each collaboration pair
    data.forEach((item) => {
      if (item.authors.length >= 2) {
        const [author1, author2] = item.authors;
        
        // Add nodes if they don't exist
        if (!nodeMap.has(author1)) {
          nodeMap.set(author1, {
            id: author1,
            name: author1,
            size: 0,
            color: '#1976d2',
            collaborations: 0
          });
        }
        
        if (!nodeMap.has(author2)) {
          nodeMap.set(author2, {
            id: author2,
            name: author2,
            size: 0,
            color: '#1976d2',
            collaborations: 0
          });
        }

        // Update collaboration counts
        const node1 = nodeMap.get(author1)!;
        const node2 = nodeMap.get(author2)!;
        node1.collaborations = (node1.collaborations || 0) + item.collaborations;
        node2.collaborations = (node2.collaborations || 0) + item.collaborations;

        // Add link
        links.push({
          source: author1,
          target: author2,
          value: item.collaborations,
          color: `rgba(25, 118, 210, ${Math.min(0.8, item.collaborations / 10)})`
        });
      }
    });

    // Update node sizes based on total collaborations
    const maxCollaborations = Math.max(...Array.from(nodeMap.values()).map(n => n.collaborations || 0));
    nodeMap.forEach((node) => {
      const collabRatio = (node.collaborations || 0) / Math.max(maxCollaborations, 1);
      node.size = Math.max(5, 5 + collabRatio * 15);
      
      // Color nodes based on collaboration intensity
      const intensity = Math.min(1, collabRatio);
      if (intensity > 0.7) {
        node.color = '#d32f2f'; // High collaboration - Red
      } else if (intensity > 0.4) {
        node.color = '#f57c00'; // Medium collaboration - Orange
      } else if (intensity > 0.2) {
        node.color = '#388e3c'; // Low collaboration - Green
      } else {
        node.color = '#1976d2'; // Very low - Blue
      }
    });

    setNetworkData({
      nodes: Array.from(nodeMap.values()),
      links: links
    });
  }, [data]);

  const handleNodeClick = (node: any) => {
    console.log('Clicked node:', node);
  };

  const handleLinkClick = (link: any) => {
    console.log('Clicked link:', link);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          공동저자 협업 네트워크
        </Typography>
        
        <Box sx={{ mb: 2, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ width: 200 }}>
            <Typography variant="caption" display="block" gutterBottom>
              링크 거리: {linkDistance}px
            </Typography>
            <Slider
              value={linkDistance}
              onChange={(_, value) => setLinkDistance(value as number)}
              min={50}
              max={200}
              size="small"
            />
          </Box>
          
          <Box sx={{ width: 200 }}>
            <Typography variant="caption" display="block" gutterBottom>
              노드 크기: {nodeSize}
            </Typography>
            <Slider
              value={nodeSize}
              onChange={(_, value) => setNodeSize(value as number)}
              min={2}
              max={10}
              size="small"
            />
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                size="small"
              />
            }
            label="라벨 표시"
          />
        </Box>

        <Box sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: '#fafafa'
        }}>
          {networkData.nodes.length > 0 ? (
            <ForceGraph2D
              ref={fgRef}
              width={width}
              height={height}
              graphData={networkData}
              nodeLabel={(node: any) => `${node.name}<br/>협업: ${node.collaborations || 0}회`}
              nodeColor={(node: any) => node.color}
              nodeVal={(node: any) => Math.max(node.size * nodeSize, nodeSize)}
              nodeCanvasObject={showLabels ? (node: any, ctx: any, globalScale: any) => {
                const label = node.name.length > 10 ? node.name.substring(0, 10) + '...' : node.name;
                const fontSize = Math.max(8, 12/globalScale);
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#333';
                ctx.fillText(label, node.x, node.y + (node.size * nodeSize + 8));
              } : undefined}
              linkColor={(link: any) => link.color}
              linkWidth={(link: any) => Math.max(1, Math.min(8, link.value * 2))}
              linkLabel={(link: any) => `${link.source.name} ↔ ${link.target.name}<br/>공동저술: ${link.value}편`}
              linkDirectionalArrowLength={0}
              linkDirectionalArrowRelPos={0}
              onNodeClick={handleNodeClick}
              onLinkClick={handleLinkClick}
              d3Force={(engine: any) => {
                engine
                  .force('link')
                  .distance(linkDistance);
                engine
                  .force('charge')
                  .strength(-300);
              }}
              cooldownTime={3000}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              backgroundColor="#fafafa"
            />
          ) : (
            <Box 
              sx={{ 
                width, 
                height, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'text.secondary'
              }}
            >
              <Typography variant="body2">
                협업 데이터가 없습니다
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary" display="block">
            • 노드 크기: 총 협업 횟수에 비례 | 노드 색상: 🔴 높음 🟠 중간 🟢 낮음 🔵 매우낮음
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            • 링크 두께: 협업 강도를 나타냄 | 마우스로 드래그하여 노드 이동 가능
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CoauthorNetworkGraph;