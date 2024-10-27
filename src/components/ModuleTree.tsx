import React, { useCallback, useEffect, useState } from 'react';
import { Tree, message } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { reorderModules } from '../services/modules';

interface Module {
  id: number;
  name: string;
  order: number;
  parent_id: number | null;
}

interface ModuleTreeProps {
  modules: Module[];
  onSelect: (moduleId: number) => void;
}

const ModuleTree: React.FC<ModuleTreeProps> = ({ modules, onSelect }) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  const buildTree = useCallback((flatModules: Module[]): DataNode[] => {
    const moduleMap = new Map<number, DataNode>();
    
    flatModules.forEach(module => {
      moduleMap.set(module.id, {
        key: module.id,
        title: module.name,
        children: [],
      });
    });

    flatModules.forEach(module => {
      const node = moduleMap.get(module.id)!;
      if (module.parent_id !== null) {
        const parentNode = moduleMap.get(module.parent_id);
        if (parentNode) {
          parentNode.children!.push(node);
        } else {
          console.warn(`Parent node with id ${module.parent_id} not found for module ${module.id}`);
        }
      }
    });

    return Array.from(moduleMap.values()).filter(node => 
      flatModules.find(m => m.id === node.key)!.parent_id === null
    );
  }, []);

  useEffect(() => {
    const sortedModules = [...modules].sort((a, b) => a.order - b.order);
    const tree = buildTree(sortedModules);
    setTreeData(tree);
  }, [modules, buildTree]);

  const flattenTree = useCallback((tree: DataNode[]): Module[] => {
    const result: Module[] = [];
    const traverse = (node: DataNode, parentId: number | null, order: number) => {
      result.push({
        id: Number(node.key),
        name: node.title as string,
        order: order,
        parent_id: parentId,
      });
      if (node.children) {
        node.children.forEach((child, index) => {
          traverse(child, Number(node.key), order * 1000 + index + 1);
        });
      }
    };
    tree.forEach((node, index) => traverse(node, null, index + 1));
    return result;
  }, []);

  const onDrop: TreeProps['onDrop'] = useCallback(async (info) => {
    const dropKey = info.node.key as number;
    const dragKey = info.dragNode.key as number;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (
      data: DataNode[], 
      key: React.Key, 
      callback: (node: DataNode, index: number, arr: DataNode[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          callback(data[i], i, data);
          return;
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };

    const data = [...treeData];

    let dragObj: DataNode;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else if (
      ((info.node as any).props.children || []).length > 0 &&
      (info.node as any).props.expanded &&
      dropPosition === 1
    ) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else {
      let ar: DataNode[] = [];
      let i: number;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i!, 0, dragObj);
      } else {
        ar.splice(i! + 1, 0, dragObj);
      }
    }

    setTreeData(data);
    const updatedModules = flattenTree(data);
    
    try {
      await reorderModules(updatedModules);
      message.success('Module order updated successfully');
    } catch (error) {
      message.error('Failed to update module order');
      console.error('Error updating module order:', error);
    }
  }, [treeData, flattenTree]);

  const handleSelect: TreeProps['onSelect'] = useCallback((selectedKeys) => {
    if (selectedKeys.length > 0) {
      onSelect(Number(selectedKeys[0]));
    }
  }, [onSelect]);

  return (
    <Tree
      className="draggable-tree"
      draggable
      blockNode
      onDrop={onDrop}
      onSelect={handleSelect}
      treeData={treeData}
    />
  );
};

export default ModuleTree;