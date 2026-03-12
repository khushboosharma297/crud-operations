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
import { User, Lightbulb, Plus, Edit2, Trash2, X, ChevronDown, TrendingUp, Users, Zap } from 'lucide-react';
import { GraphData, Person, Skill, Connection, ProficiencyLevel } from '@/lib/types';
import { loadData, saveData, generateId } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const proficiencyConfig: Record<ProficiencyLevel, { color: string; bgColor: string; label: string }> = {
  learning: { color: '#f59e0b', bgColor: '#fef3c7', label: 'Learning' },
  familiar: { color: '#3b82f6', bgColor: '#dbeafe', label: 'Familiar' },
  expert: { color: '#10b981', bgColor: '#d1fae5', label: 'Expert' },
};

export default function TeamSkillMatrix() {
  const [data, setData] = useState<GraphData>({ people: [], skills: [], connections: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<{ type: 'person' | 'skill'; id: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<'person' | 'skill' | 'connection' | null>(null);
  const [editingNode, setEditingNode] = useState<{ type: 'person' | 'skill'; id: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: '',
    person_id: '',
    skill_id: '',
    proficiency: 'learning' as ProficiencyLevel,
  });

  const resetFormData = () => {
    setFormData({ name: '', role: '', category: '', person_id: '', skill_id: '', proficiency: 'learning' });
  };

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
  }, []);

  useEffect(() => {
    if (data.people.length === 0) return;

    const personNodes: Node[] = data.people.map((person, idx) => ({
      id: person.id,
      type: 'default',
      position: { x: 80, y: idx * 140 + 50 },
      data: {
        label: (
          <div className="flex items-center gap-2 py-1">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            </div>
            <div className="text-left min-w-0">
              <div className="font-bold text-sm leading-tight">{person.name}</div>
              {person.role && <div className="text-xs text-slate-600 truncate">{person.role}</div>}
            </div>
          </div>
        ),
      },
      style: {
        background: 'white',
        border: '2px solid #dbeafe',
        borderRadius: '12px',
        padding: '8px',
        width: 170,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const skillNodes: Node[] = data.skills.map((skill, idx) => ({
      id: skill.id,
      type: 'default',
      position: { x: 520, y: idx * 100 + 50 },
      data: {
        label: (
          <div className="flex items-center gap-2 py-1">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Lightbulb size={16} className="text-white" />
              </div>
            </div>
            <div className="text-left min-w-0">
              <div className="font-bold text-sm leading-tight">{skill.name}</div>
              {skill.category && <div className="text-xs text-slate-600">{skill.category}</div>}
            </div>
          </div>
        ),
      },
      style: {
        background: 'white',
        border: '2px solid #e9d5ff',
        borderRadius: '12px',
        padding: '8px',
        width: 160,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const connectionEdges: Edge[] = data.connections.map((conn) => {
      const config = proficiencyConfig[conn.proficiency];
      return {
        id: `${conn.person_id}-${conn.skill_id}`,
        source: conn.person_id,
        target: conn.skill_id,
        label: config.label,
        style: { stroke: config.color, strokeWidth: 2.5 },
        labelStyle: { fill: config.color, fontWeight: 700, fontSize: '11px', background: 'white', padding: '2px 4px', borderRadius: '4px' },
        markerEnd: { type: MarkerType.ArrowClosed, color: config.color },
      };
    });

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
    setSidebarOpen(true);
  }, [data.people]);

  const addPerson = () => {
    const newPerson: Person = {
      id: generateId('p'),
      name: formData.name,
      role: formData.role || undefined,
    };
    updateData({ ...data, people: [...data.people, newPerson] });
    setShowAddDialog(null);
    resetFormData();
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: generateId('s'),
      name: formData.name,
      category: formData.category || undefined,
    };
    updateData({ ...data, skills: [...data.skills, newSkill] });
    setShowAddDialog(null);
    resetFormData();
  };

  const addConnection = () => {
    if (!formData.person_id || !formData.skill_id) return;

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
    resetFormData();
  };

  const updatePerson = () => {
    if (!editingNode) return;
    const updated = data.people.map((p) =>
      p.id === editingNode.id ? { ...p, name: formData.name, role: formData.role || undefined } : p
    );
    updateData({ ...data, people: updated });
    setEditingNode(null);
    resetFormData();
  };

  const updateSkill = () => {
    if (!editingNode) return;
    const updated = data.skills.map((s) =>
      s.id === editingNode.id ? { ...s, name: formData.name, category: formData.category || undefined } : s
    );
    updateData({ ...data, skills: updated });
    setEditingNode(null);
    resetFormData();
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

  const stats = {
    totalPeople: data.people.length,
    totalSkills: data.skills.length,
    totalConnections: data.connections.length,
    expertCount: data.connections.filter((c) => c.proficiency === 'expert').length,
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
          >
            <Background color="#e0e7ff" size={50} />
            <Controls />
            <MiniMap style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }} />
          </ReactFlow>
        </div>

        <div className="absolute top-6 left-6 flex flex-col gap-3">
          <div className="bg-white rounded-lg shadow-lg p-4 backdrop-blur-sm bg-white/95 space-y-2 w-56">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              Skill Matrix Overview
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="text-xs text-slate-600 font-medium">Team Members</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalPeople}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                <div className="text-xs text-slate-600 font-medium">Skills</div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalSkills}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                <div className="text-xs text-slate-600 font-medium">Expert Level</div>
                <div className="text-2xl font-bold text-green-600">{stats.expertCount}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3">
                <div className="text-xs text-slate-600 font-medium">Total Links</div>
                <div className="text-2xl font-bold text-amber-600">{stats.totalConnections}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 backdrop-blur-sm bg-white/95 space-y-2 w-56">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Plus size={16} className="text-slate-600" />
              Quick Actions
            </h3>
            <Button
              onClick={() => setShowAddDialog('person')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-9 text-sm"
            >
              <User size={16} /> Add Person
            </Button>
            <Button
              onClick={() => setShowAddDialog('skill')}
              variant="secondary"
              className="w-full gap-2 h-9 text-sm"
            >
              <Lightbulb size={16} /> Add Skill
            </Button>
            <Button
              onClick={() => setShowAddDialog('connection')}
              variant="outline"
              className="w-full gap-2 h-9 text-sm"
            >
              <Zap size={16} /> Add Connection
            </Button>
          </div>
        </div>
      </div>

      {selectedNode && sidebarOpen && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white flex items-start justify-between">
            <div className="flex items-center gap-3">
              {selectedNode.type === 'person' ? (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Lightbulb size={24} />
                </div>
              )}
              <div>
                <h2 className="font-bold text-lg">{selectedPerson?.name || selectedSkill?.name}</h2>
                <p className="text-blue-100 text-sm">
                  {selectedNode.type === 'person' ? 'Team Member' : 'Skill'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedNode(null)}
              className="text-white hover:bg-white/20"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            {selectedPerson && (
              <>
                {selectedPerson.role && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Role</div>
                    <p className="text-sm font-medium text-slate-900">{selectedPerson.role}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setEditingNode({ type: 'person', id: selectedPerson.id });
                      setFormData({ ...formData, name: selectedPerson.name, role: selectedPerson.role || '' });
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => deletePerson(selectedPerson.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" />
                    Skills ({personSkills.length})
                  </h3>
                  <div className="space-y-2">
                    {personSkills.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No skills assigned</p>
                    ) : (
                      personSkills.map(({ skill, proficiency }) => {
                        const config = proficiencyConfig[proficiency];
                        return (
                          <div key={skill.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{skill.name}</div>
                              <div className="text-xs mt-1 font-medium" style={{ color: config.color }}>
                                {config.label}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => deleteConnection(selectedPerson.id, skill.id)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedSkill && (
              <>
                {selectedSkill.category && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Category</div>
                    <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                      {selectedSkill.category}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setEditingNode({ type: 'skill', id: selectedSkill.id });
                      setFormData({ ...formData, name: selectedSkill.name, category: selectedSkill.category || '' });
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => deleteSkill(selectedSkill.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    Team Members ({skillPeople.length})
                  </h3>
                  <div className="space-y-2">
                    {skillPeople.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No one has this skill yet</p>
                    ) : (
                      skillPeople.map(({ person, proficiency }) => {
                        const config = proficiencyConfig[proficiency];
                        return (
                          <div key={person.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{person.name}</div>
                              <div className="text-xs mt-1 font-medium" style={{ color: config.color }}>
                                {config.label}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => deleteConnection(person.id, selectedSkill.id)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Dialog open={showAddDialog === 'person'} onOpenChange={() => setShowAddDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Add Team Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Smith"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-sm font-medium">
                Role (optional)
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., Senior Engineer"
                className="mt-2"
              />
            </div>
            <Button onClick={addPerson} disabled={!formData.name} className="w-full bg-blue-600 hover:bg-blue-700">
              Add Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog === 'skill'} onOpenChange={() => setShowAddDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb size={20} className="text-purple-600" />
              Add Skill
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="skill-name" className="text-sm font-medium">
                Skill Name
              </Label>
              <Input
                id="skill-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., React.js"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-sm font-medium">
                Category (optional)
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Frontend"
                className="mt-2"
              />
            </div>
            <Button onClick={addSkill} disabled={!formData.name} className="w-full bg-purple-600 hover:bg-purple-700">
              Add Skill
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog === 'connection'} onOpenChange={() => setShowAddDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              Create Connection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="person" className="text-sm font-medium">
                Team Member
              </Label>
              <Select value={formData.person_id} onValueChange={(v) => setFormData({ ...formData, person_id: v })}>
                <SelectTrigger id="person" className="mt-2">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {data.people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.role && ` • ${p.role}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skill" className="text-sm font-medium">
                Skill
              </Label>
              <Select value={formData.skill_id} onValueChange={(v) => setFormData({ ...formData, skill_id: v })}>
                <SelectTrigger id="skill" className="mt-2">
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {data.skills.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      {s.category && ` • ${s.category}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="proficiency" className="text-sm font-medium">
                Proficiency Level
              </Label>
              <Select
                value={formData.proficiency}
                onValueChange={(v) => setFormData({ ...formData, proficiency: v as ProficiencyLevel })}
              >
                <SelectTrigger id="proficiency" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learning">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                      Learning
                    </span>
                  </SelectItem>
                  <SelectItem value="familiar">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
                      Familiar
                    </span>
                  </SelectItem>
                  <SelectItem value="expert">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                      Expert
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addConnection}
              disabled={!formData.person_id || !formData.skill_id}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Create Connection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode?.type === 'person'} onOpenChange={() => setEditingNode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-role" className="text-sm font-medium">
                Role (optional)
              </Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-2"
              />
            </div>
            <Button onClick={updatePerson} disabled={!formData.name} className="w-full bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode?.type === 'skill'} onOpenChange={() => setEditingNode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-skill-name" className="text-sm font-medium">
                Skill Name
              </Label>
              <Input
                id="edit-skill-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-category" className="text-sm font-medium">
                Category (optional)
              </Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2"
              />
            </div>
            <Button onClick={updateSkill} disabled={!formData.name} className="w-full bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
