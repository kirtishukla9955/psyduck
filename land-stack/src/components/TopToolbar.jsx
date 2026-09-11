import React from 'react';
import { Undo, FolderOpen, Save, RefreshCw, Bookmark, Filter, Layers, Flag, Search, Edit3, Image, Ruler, Settings, Folder } from 'lucide-react';
import SearchBar from './SearchBar';

const IconButton = ({ icon: Icon, active }) => (
  <button className={`p-2 rounded transition-colors ${active ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
    <Icon className="w-4 h-4" />
  </button>
);

export default function TopToolbar() {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
      
      {/* Left Toolbar */}
      <div className="glass-panel h-12 px-2 rounded-lg flex items-center gap-1 pointer-events-auto">
        <IconButton icon={Undo} />
        <IconButton icon={FolderOpen} />
        <IconButton icon={Save} />
        <div className="w-px h-6 bg-white/10 mx-1" />
        <IconButton icon={RefreshCw} />
        <IconButton icon={Bookmark} />
        <IconButton icon={Filter} />
        <div className="w-px h-6 bg-white/10 mx-1" />
        <IconButton icon={Layers} active />
        <IconButton icon={Flag} />
        <SearchBar />
        <IconButton icon={Edit3} />
      </div>

      {/* Right Toolbar */}
      <div className="glass-panel h-12 px-2 rounded-lg flex items-center gap-1 pointer-events-auto">
        <IconButton icon={Image} />
        <IconButton icon={Ruler} />
        <div className="w-px h-6 bg-white/10 mx-1" />
        <IconButton icon={Folder} />
        <IconButton icon={Settings} />
      </div>

    </div>
  );
}
