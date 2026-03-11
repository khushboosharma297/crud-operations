'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, Lightbulb, Plus, CreditCard as Edit2, Trash2, X } from 'lucide-react';
import { GraphData, Person, Skill, Connection, ProficiencyLevel } from '@/lib/types';
import { loadData, saveData, generateId } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const proficiencyColors: Record<ProficiencyLevel, string> = {
  learning: '#fbbf24',
  familiar: '#60a5fa',
  expert: '#34d399',
};

export default function TeamSkillMatrix() {
  const [data, setData] = useState<GraphData>({ people: [], skills: [], connections: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<{ type: 'person' | 'skill'; id: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<'person' | 'skill' | 'connection' | null>(null);
  const [editingNode, setEditingNode] = useState<{ type: 'person' | 'skill'; id: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: '',
    person_id: '',
    skill_id: '',
    proficiency: 'learning' as ProficiencyLevel,
  });

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
  }, []);

  useEffect(() => {
    if (data.people.length === 0) return;

    const personNodes: Node[] = data.people.map((person, idx) => ({
      id: person.id,
      type: 'default',
      position: { x: 100, y: idx * 120 + 50 },
      data: {
        label: (
          <div className="flex items-center gap-2">
            <User size={16} />
            <div className="text-left">
              <div className="font-semibold">{person.name}</div>
              {person.role && <div className="text-xs text-muted-foreground">{person.role}</div>}
            </div>
          </div>
        ),
      },
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '2px solid #1e40af',
        borderRadius: '8px',
        padding: '10px',
        width: 180,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const skillNodes: Node[] = data.skills.map((skill, idx) => ({
      id: skill.id,
      type: 'default',
      position: { x: 500, y: idx * 100 + 50 },
      data: {
        label: (
          <div className="flex items-center gap-2">
            <Lightbulb size={16} />
            <div className="text-left">
              <div className="font-semibold">{skill.name}</div>
              {skill.category && <div className="text-xs text-muted-foreground">{skill.category}</div>}
            </div>
          </div>
        ),
      },
      style: {
        background: '#8b5cf6',
        color: 'white',
        border: '2px solid #6d28d9',
        borderRadius: '8px',
        padding: '10px',
        width: 160,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const connectionEdges: Edge[] = data.connections.map((conn) => ({
      id: `${conn.person_id}-${conn.skill_id}`,
      source: conn.person_id,
      target: conn.skill_id,
      label: conn.proficiency,
      style: { stroke: proficiencyColors[conn.proficiency], strokeWidth: 2 },
      labelStyle: { fill: proficiencyColors[conn.proficiency], fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: proficiencyColors[conn.proficiency] },
    }));

    setNodes([...personNodes, ...skillNodes]);
    setEdges(connectionEdges);
  }, [data, setNodes, setEdges]);

  const updateData = useCallback((newData: GraphData) => {
    setData(newData);
    saveData(newData);
  }, []);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    const isPerson = data.people.some((p) => p.id === node.id);
    setSelectedNode({
      type: isPerson ? 'person' : 'skill',
      id: node.id,
    });
  }, [data.people]);

  const addPerson = () => {
    const newPerson: Person = {
      id: generateId('p'),
      name: formData.name,
      role: formData.role || undefined,
    };
    updateData({ ...data, people: [...data.people, newPerson] });
    setShowAddDialog(null);
    setFormData({ name: '', role: '', category: '', person_id: '', skill_id: '', proficiency: 'learning' });
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: generateId('s'),
      name: formData.name,
      category: formData.category || undefined,
    };
    updateData({ ...data, skills: [...data.skills, newSkill] });
    setShowAddDialog(null);
    setFormData({ name: '', role: '', category: '', person_id: '', skill_id: '', proficiency: 'learning' });
  };

  const addConnection = () => {
    const exists = data.connections.some(
      (c) => c.person_id === formData.person_id && c.skill_id === formData.skill_id
    );
    if (exists) return;

    const newConnection: Connection = {
      person_id: formData.person_id,
      skill_id: formData.skill_id,
      proficiency: formData.proficiency,
    };
    updateData({ ...data, connections: [...data.connections, newConnection] });
    setShowAddDialog(null);
    setFormData({ name: '', role: '', category: '', person_id: '', skill_id: '', proficiency: 'learning' });
  };

  const updatePerson = () => {
    if (!editingNode) return;
    const updated = data.people.map((p) =>
      p.id === editingNode.id ? { ...p, name: formData.name, role: formData.role || undefined } : p
    );
    updateData({ ...data, people: updated });
    setEditingNode(null);
    setFormData({ name: '', role: '', category: '', person_id: '', skill_id: '', proficiency: 'learning' });
  };

  const updateSkill = () => {
    if (!editingNode) return;
    const updated = data.skills.map((s) =>
      s.id === editingNode.id ? { ...s, name: formData.name, category: formData.category || undefined } : s
    );
    updateData({ ...data, skills: updated });
    setEditingNode(null);
    setFormData({ name: '', role: '', category: '', person_id: '', skill_id: '', proficiency: 'learning' });
  };

  const deletePerson = (id: string) => {
    updateData({
      people: data.people.filter((p) => p.id !== id),
      skills: data.skills,
      connections: data.connections.filter((c) => c.person_id !== id),
    });
    setSelectedNode(null);
  };

  const deleteSkill = (id: string) => {
    updateData({
      people: data.people,
      skills: data.skills.filter((s) => s.id !== id),
      connections: data.connections.filter((c) => c.skill_id !== id),
    });
    setSelectedNode(null);
  };

  const deleteConnection = (personId: string, skillId: string) => {
    updateData({
      ...data,
      connections: data.connections.filter((c) => !(c.person_id === personId && c.skill_id === skillId)),
    });
  };

  const selectedPerson = selectedNode?.type === 'person' ? data.people.find((p) => p.id === selectedNode.id) : null;
  const selectedSkill = selectedNode?.type === 'skill' ? data.skills.find((s) => s.id === selectedNode.id) : null;

  const personSkills = selectedPerson
    ? data.connections.filter((c) => c.person_id === selectedPerson.id).map((c) => ({
        skill: data.skills.find((s) => s.id === c.skill_id)!,
        proficiency: c.proficiency,
      }))
    : [];

  const skillPeople = selectedSkill
    ? data.connections.filter((c) => c.skill_id === selectedSkill.id).map((c) => ({
        person: data.people.find((p) => p.id === c.person_id)!,
        proficiency: c.proficiency,
      }))
    : [];

  return (
    <div className="h-screen flex">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Button onClick={() => setShowAddDialog('person')} className="gap-2">
            <Plus size={16} /> Add Person
          </Button>
          <Button onClick={() => setShowAddDialog('skill')} variant="secondary" className="gap-2">
            <Plus size={16} /> Add Skill
          </Button>
          <Button onClick={() => setShowAddDialog('connection')} variant="outline" className="gap-2">
            <Plus size={16} /> Add Connection
          </Button>
        </div>
      </div>

      {selectedNode && (
        <Card className="w-96 m-4 overflow-auto">
          <CardHeader className="flex flex-row items-start justify-between">
            <CardTitle className="flex items-center gap-2">
              {selectedNode.type === 'person' ? <User size={20} /> : <Lightbulb size={20} />}
              {selectedPerson?.name || selectedSkill?.name}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}>
              <X size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            {selectedPerson && (
              <>
                {selectedPerson.role && <p className="text-sm text-muted-foreground mb-4">{selectedPerson.role}</p>}
                <div className="flex gap-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingNode({ type: 'person', id: selectedPerson.id });
                      setFormData({ ...formData, name: selectedPerson.name, role: selectedPerson.role || '' });
                    }}
                  >
                    <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePerson(selectedPerson.id)}>
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </div>
                <h3 className="font-semibold mb-2">Skills ({personSkills.length})</h3>
                <div className="space-y-2">
                  {personSkills.map(({ skill, proficiency }) => (
                    <div key={skill.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-xs" style={{ color: proficiencyColors[proficiency] }}>
                          {proficiency}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteConnection(selectedPerson.id, skill.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedSkill && (
              <>
                {selectedSkill.category && <p className="text-sm text-muted-foreground mb-4">{selectedSkill.category}</p>}
                <div className="flex gap-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingNode({ type: 'skill', id: selectedSkill.id });
                      setFormData({ ...formData, name: selectedSkill.name, category: selectedSkill.category || '' });
                    }}
                  >
                    <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteSkill(selectedSkill.id)}>
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </div>
                <h3 className="font-semibold mb-2">Team Members ({skillPeople.length})</h3>
                <div className="space-y-2">
                  {skillPeople.map(({ person, proficiency }) => (
                    <div key={person.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium">{person.name}</div>
                        <div className="text-xs" style={{ color: proficiencyColors[proficiency] }}>
                          {proficiency}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteConnection(person.id, selectedSkill.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddDialog === 'person'} onOpenChange={() => setShowAddDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Role (optional)</Label>
              <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
            </div>
            <Button onClick={addPerson} disabled={!formData.name}>
              Add Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog === 'skill'} onOpenChange={() => setShowAddDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Category (optional)</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            </div>
            <Button onClick={addSkill} disabled={!formData.name}>
              Add Skill
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog === 'connection'} onOpenChange={() => setShowAddDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Connection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Person</Label>
              <Select value={formData.person_id} onValueChange={(v) => setFormData({ ...formData, person_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {data.people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Skill</Label>
              <Select value={formData.skill_id} onValueChange={(v) => setFormData({ ...formData, skill_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {data.skills.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Proficiency</Label>
              <Select
                value={formData.proficiency}
                onValueChange={(v) => setFormData({ ...formData, proficiency: v as ProficiencyLevel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="familiar">Familiar</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addConnection} disabled={!formData.person_id || !formData.skill_id}>
              Add Connection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode?.type === 'person'} onOpenChange={() => setEditingNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Role (optional)</Label>
              <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
            </div>
            <Button onClick={updatePerson} disabled={!formData.name}>
              Update Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode?.type === 'skill'} onOpenChange={() => setEditingNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Category (optional)</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            </div>
            <Button onClick={updateSkill} disabled={!formData.name}>
              Update Skill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
