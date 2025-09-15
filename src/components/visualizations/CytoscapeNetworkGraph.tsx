import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

// Register the layout extension
cytoscape.use(coseBilkent);

interface CoauthorData {
  authors: string[];
  collaborations: number;
}

interface CytoscapeNetworkGraphProps {
  data: CoauthorData[];
  width?: number;
  height?: number;
}

const CytoscapeNetworkGraph: React.FC<CytoscapeNetworkGraphProps> = ({ 
  data, 
  width = 800, 
  height = 500 
}) => {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<Core | null>(null);
  const [layout, setLayout] = useState<string>('cose-bilkent');
  const [showLabels, setShowLabels] = useState<'all' | 'hover' | 'none'>('all');

  useEffect(() => {
    if (!cyRef.current || !data || data.length === 0) return;

    // Prepare nodes and edges data
    const nodeMap = new Map<string, any>();
    const edges: ElementDefinition[] = [];

    // Process collaboration data
    data.forEach((item, index) => {
      if (item.authors.length >= 2) {
        const [author1, author2] = item.authors;
        
        // Add nodes
        if (!nodeMap.has(author1)) {
          nodeMap.set(author1, {
            data: { 
              id: author1, 
              label: author1,
              collaborations: 0,
              shortLabel: author1.length > 12 ? author1.substring(0, 12) + '...' : author1
            }
          });
        }
        
        if (!nodeMap.has(author2)) {
          nodeMap.set(author2, {
            data: { 
              id: author2, 
              label: author2,
              collaborations: 0,
              shortLabel: author2.length > 12 ? author2.substring(0, 12) + '...' : author2
            }
          });
        }

        // Update collaboration counts
        const node1 = nodeMap.get(author1);
        const node2 = nodeMap.get(author2);
        node1.data.collaborations += item.collaborations;
        node2.data.collaborations += item.collaborations;

        // Add edge
        edges.push({
          data: {
            id: `${author1}-${author2}`,
            source: author1,
            target: author2,
            strength: item.collaborations,
            label: `${item.collaborations}편`
          }
        });
      }
    });

    const nodes = Array.from(nodeMap.values());
    const maxCollaborations = Math.max(...nodes.map(n => n.data.collaborations));

    // Update node sizes and colors based on collaboration intensity
    nodes.forEach(node => {
      const intensity = node.data.collaborations / Math.max(maxCollaborations, 1);
      node.data.size = Math.max(30, 30 + intensity * 40);
      
      if (intensity > 0.7) {
        node.data.color = '#e53e3e'; // High - Red
      } else if (intensity > 0.4) {
        node.data.color = '#fd8f02'; // Medium - Orange
      } else if (intensity > 0.2) {
        node.data.color = '#38a169'; // Low - Green
      } else {
        node.data.color = '#3182ce'; // Very Low - Blue
      }
    });

    // Destroy existing instance
    if (cyInstance.current) {
      cyInstance.current.destroy();
    }

    // Create cytoscape instance
    cyInstance.current = cytoscape({
      container: cyRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'width': 'data(size)',
            'height': 'data(size)',
            'label': showLabels === 'all' ? 'data(shortLabel)' : '',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#333',
            'text-outline-width': 2,
            'text-outline-color': '#fff',
            'font-size': '12px',
            'font-weight': 'bold',
            'border-width': 2,
            'border-color': '#fff',
            'cursor': 'pointer'
          }
        },
        {
          selector: 'node:hover',
          style: {
            'label': 'data(label)',
            'background-color': '#4a90e2',
            'border-color': '#2c5aa0',
            'border-width': 3,
            'font-size': '14px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 'mapData(strength, 1, 10, 2, 10)',
            'line-color': '#cbd5e0',
            'target-arrow-color': '#cbd5e0',
            'curve-style': 'bezier',
            'opacity': 0.7,
            'label': showLabels === 'all' ? 'data(label)' : '',
            'font-size': '10px',
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            'color': '#666'
          }
        },
        {
          selector: 'edge:hover',
          style: {
            'width': 'mapData(strength, 1, 10, 4, 14)',
            'line-color': '#4a90e2',
            'opacity': 1,
            'label': 'data(label)'
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': 'mapData(strength, 1, 10, 4, 14)',
            'line-color': '#e53e3e',
            'opacity': 1
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'background-color': '#e53e3e',
            'border-color': '#c53030',
            'border-width': 3,
            'font-size': '16px'
          }
        }
      ],
      layout: getLayoutConfig(layout),
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      selectionType: 'single',
      wheelSensitivity: 0.1
    });

    // Event handlers
    cyInstance.current.on('tap', 'node', function(evt) {
      const node = evt.target;
      
      // Reset all highlights
      cyInstance.current!.elements().removeClass('highlighted');
      
      // Highlight clicked node and its connections
      node.addClass('highlighted');
      node.connectedEdges().addClass('highlighted');
      node.neighborhood().addClass('highlighted');
    });

    cyInstance.current.on('tap', function(evt) {
      if (evt.target === cyInstance.current) {
        cyInstance.current!.elements().removeClass('highlighted');
      }
    });

    // Fit to container
    cyInstance.current.fit();
    cyInstance.current.center();

    return () => {
      if (cyInstance.current) {
        cyInstance.current.destroy();
      }
    };
  }, [data, layout, showLabels]);

  const getLayoutConfig = (layoutName: string) => {
    const baseConfig = {
      animate: true,
      animationDuration: 1000,
      animationEasing: 'ease-out'
    };

    switch (layoutName) {
      case 'cose-bilkent':
        return {
          name: 'cose-bilkent',
          ...baseConfig,
          nodeDimensionsIncludeLabels: true,
          idealEdgeLength: 100,
          nodeRepulsion: 4500,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500,
          tile: true,
          tilingPaddingVertical: 10,
          tilingPaddingHorizontal: 10
        };
      case 'circle':
        return {
          name: 'circle',
          ...baseConfig,
          radius: Math.min(width, height) / 3,
          spacing: 40
        };
      case 'grid':
        return {
          name: 'grid',
          ...baseConfig,
          rows: Math.ceil(Math.sqrt(data.length * 2)),
          cols: Math.ceil(Math.sqrt(data.length * 2)),
          position: (node: any) => {
            return { row: 0, col: 0 }; // Cytoscape will handle positioning
          }
        };
      case 'concentric':
        return {
          name: 'concentric',
          ...baseConfig,
          concentric: (node: any) => {
            return node.data('collaborations');
          },
          levelWidth: () => {
            return 2;
          },
          minNodeSpacing: 50
        };
      default:
        return { name: 'random', ...baseConfig };
    }
  };

  const handleLayoutChange = (_event: React.MouseEvent<HTMLElement>, newLayout: string | null) => {
    if (newLayout && cyInstance.current) {
      setLayout(newLayout);
    }
  };

  const handleLabelsChange = (event: any) => {
    setShowLabels(event.target.value);
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            공동저자 협업 네트워크
          </Typography>
          <Box 
            sx={{ 
              width, 
              height, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'text.secondary',
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 1
            }}
          >
            <Typography variant="body2">
              협업 데이터가 없습니다
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          공동저자 협업 네트워크
        </Typography>
        
        {/* Controls */}
        <Box sx={{ mb: 2, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            value={layout}
            exclusive
            onChange={handleLayoutChange}
            size="small"
          >
            <ToggleButton value="cose-bilkent">최적화</ToggleButton>
            <ToggleButton value="circle">원형</ToggleButton>
            <ToggleButton value="grid">격자</ToggleButton>
            <ToggleButton value="concentric">동심원</ToggleButton>
          </ToggleButtonGroup>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>라벨 표시</InputLabel>
            <Select value={showLabels} onChange={handleLabelsChange}>
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="hover">호버시</MenuItem>
              <MenuItem value="none">숨김</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Graph Container */}
        <Box sx={{ 
          border: '1px solid #e2e8f0', 
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: '#fafafa'
        }}>
          <div 
            ref={cyRef} 
            style={{ 
              width: `${width}px`, 
              height: `${height}px`,
              cursor: 'grab'
            }}
          />
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary" display="block">
            • 노드 크기: 총 협업 횟수에 비례 | 노드 색상: 🔴 높음 🟠 중간 🟢 낮음 🔵 매우낮음
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            • 선 두께: 협업 강도 | 노드 클릭: 관련 연결 하이라이트 | 마우스 휠: 줌
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CytoscapeNetworkGraph;