import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Scissors,
  Layers,
  FileText,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { PolicyDocument } from '../types';

interface KnowledgeBaseExplorerProps {
  documents: PolicyDocument[];
  onAddDocument: (doc: PolicyDocument) => void;
}

export const KnowledgeBaseExplorer: React.FC<KnowledgeBaseExplorerProps> = ({
  documents,
  onAddDocument,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.doc_id || '');
  const [chunkStrategy, setChunkStrategy] = useState<'sentence_based' | 'fixed_size'>('sentence_based');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Document Form
  const [newDocId, setNewDocId] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const selectedDoc = documents.find(d => d.doc_id === selectedDocId) || documents[0];

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocId.trim() || !newTitle.trim() || !newContent.trim()) return;

    const formattedId = newDocId.toUpperCase().startsWith('DOC-')
      ? newDocId.toUpperCase()
      : `DOC-${newDocId.toUpperCase()}`;

    const newDoc: PolicyDocument = {
      doc_id: formattedId,
      topic: newTopic.trim() || 'General Operations',
      title: newTitle.trim(),
      content: newContent.trim(),
    };

    onAddDocument(newDoc);
    setSelectedDocId(newDoc.doc_id);
    setShowAddModal(false);
    setNewDocId('');
    setNewTopic('');
    setNewTitle('');
    setNewContent('');
  };

  // Compute chunks for current document
  const computeChunks = (doc: PolicyDocument) => {
    if (chunkStrategy === 'sentence_based') {
      const sentences = doc.content.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      return sentences.map((s, idx) => ({
        id: `${doc.doc_id}-SENT-${String(idx + 1).padStart(2, '0')}`,
        title: doc.title,
        text: `${doc.title}: ${s}`,
        strategy: 'Sentence Boundary',
      }));
    } else {
      // Fixed size chunking (approx 100 tokens with 20 overlap)
      const words = doc.content.split(/\s+/);
      const chunks = [];
      const chunkSize = 25; // 25 words approximation for demonstration
      const overlap = 5;
      let i = 0;
      let chunkIdx = 1;
      while (i < words.length) {
        const slice = words.slice(i, i + chunkSize).join(' ');
        chunks.push({
          id: `${doc.doc_id}-FIXED-${String(chunkIdx).padStart(2, '0')}`,
          title: doc.title,
          text: slice,
          strategy: 'Fixed Size (100 tok, 20 ovlp)',
        });
        chunkIdx++;
        i += chunkSize - overlap;
      }
      return chunks;
    }
  };

  const currentChunks = selectedDoc ? computeChunks(selectedDoc) : [];

  const filteredDocs = documents.filter(
    d =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.doc_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="knowledge-base-container" className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-700" />
            Regulatory Policy Knowledge Base ({documents.length} Documents)
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Indexed into Vector Space with Dual-Strategy Chunking (Fixed-Size vs Sentence-Based)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Policy Document
          </button>
        </div>
      </div>

      {/* Main Layout: Document List on Left, Document & Chunks on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Document Sidebar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search policy doc..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-800 outline-none"
            />
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredDocs.map(doc => (
              <button
                key={doc.doc_id}
                onClick={() => setSelectedDocId(doc.doc_id)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                  selectedDocId === doc.doc_id
                    ? 'border-stone-800 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono opacity-80 mb-1">
                  <span>{doc.doc_id}</span>
                  <span className="truncate max-w-[120px]">{doc.topic}</span>
                </div>
                <h4 className="text-xs font-semibold leading-snug line-clamp-2">{doc.title}</h4>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Document Details and Vector Chunks */}
        <div className="md:col-span-2 space-y-4">
          {selectedDoc ? (
            <>
              {/* Document Overview Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px] text-stone-700 border border-stone-200">
                    {selectedDoc.doc_id}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">{selectedDoc.topic}</span>
                </div>
                <h3 className="text-base font-bold text-stone-900">{selectedDoc.title}</h3>
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                  {selectedDoc.content}
                </p>
              </div>

              {/* Chunking Strategy Toggle & Inspector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-stone-700" />
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                      Vector Chunks ({currentChunks.length} Chunks)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-stone-200 p-0.5 rounded-lg text-[11px]">
                    <button
                      onClick={() => setChunkStrategy('sentence_based')}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        chunkStrategy === 'sentence_based'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Sentence-Based (Recommended)
                    </button>
                    <button
                      onClick={() => setChunkStrategy('fixed_size')}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        chunkStrategy === 'fixed_size'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Fixed-Size (100w/20w)
                    </button>
                  </div>
                </div>

                {/* Chunks Feed */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {currentChunks.map(chunk => (
                    <div
                      key={chunk.id}
                      className="p-3 rounded-lg border border-stone-200 bg-white shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                        <span className="font-semibold text-stone-800">{chunk.id}</span>
                        <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                          {chunk.strategy}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed font-sans">{chunk.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-stone-500">Select a policy document</div>
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900">Add Regulatory Policy Document</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Document ID (e.g. DOC-GOLD-LOAN-REFINANCE)
                </label>
                <input
                  type="text"
                  required
                  placeholder="DOC-GOLD-LOAN-RULES"
                  value={newDocId}
                  onChange={e => setNewDocId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Domain Topic</label>
                <input
                  type="text"
                  required
                  placeholder="Lending Operations / Collateral Management"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Policy Title</label>
                <input
                  type="text"
                  required
                  placeholder="Official Title of the Banking Circular"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Regulatory Content Clauses
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter complete policy clauses. The agent will automatically generate sentence chunks and index them into vector search."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
                >
                  Ingest & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
