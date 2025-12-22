import React, { useState } from 'react';
import { X, Search, Image as ImageIcon, Laptop, Smartphone, Box } from 'lucide-react';

interface Asset {
    id: string;
    url: string;
    type: 'screenshot_desktop' | 'screenshot_mobile' | 'logo' | 'general';
    name: string;
}

// Curated high-quality assets for "Wow" factor
const PRESET_ASSETS: Asset[] = [
    // Desktop Screenshots
    { id: 'd1', type: 'screenshot_desktop', name: 'SaaS Dashboard Dark', url: 'https://cdn.dribbble.com/users/4859/screenshots/14619375/media/16630441006560938477610080.png' },
    { id: 'd2', type: 'screenshot_desktop', name: 'Analytics Light', url: 'https://cdn.dribbble.com/users/1615584/screenshots/15710296/media/ff704743fb72dc024a1006093406260a.jpg' },
    { id: 'd3', type: 'screenshot_desktop', name: 'Kanban Board', url: 'https://cdn.dribbble.com/users/4189231/screenshots/17431713/media/1077663e271ee94e636b099307c8971f.png' },
    { id: 'd4', type: 'screenshot_desktop', name: 'Financial Graph', url: 'https://cdn.dribbble.com/users/158863/screenshots/15234237/media/01306385a4a4993a436573c73f324208.png' },

    // Mobile Screenshots
    { id: 'm1', type: 'screenshot_mobile', name: 'Mobile Profile', url: 'https://cdn.dribbble.com/users/5031392/screenshots/15467520/media/c84234b22f099db5a1e263223072236a.png' },
    { id: 'm2', type: 'screenshot_mobile', name: 'Mobile Feed', url: 'https://cdn.dribbble.com/users/254661/screenshots/13531952/media/4c004a434c0343a4270c562e646279b9.png' },
    { id: 'm3', type: 'screenshot_mobile', name: 'Mobile Chart', url: 'https://cdn.dribbble.com/users/1126935/screenshots/15392070/media/1e4860b77b102ce0fcb88827fa1032df.png' },

    // Logos
    { id: 'l1', type: 'logo', name: 'Stripe', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
    { id: 'l2', type: 'logo', name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { id: 'l3', type: 'logo', name: 'Shopify', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg' }
];

interface AssetLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    initialTab?: 'screenshot_desktop' | 'screenshot_mobile' | 'logo';
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
    isOpen,
    onClose,
    onSelect,
    initialTab = 'screenshot_desktop'
}) => {
    const [activeTab, setActiveTab] = useState<string>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredAssets = PRESET_ASSETS.filter(asset =>
        (activeTab === 'all' || asset.type === activeTab) &&
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'screenshot_desktop', label: 'Desktop', icon: <Laptop size={14} /> },
        { id: 'screenshot_mobile', label: 'Mobile', icon: <Smartphone size={14} /> },
        { id: 'logo', label: 'Logos', icon: <Box size={14} /> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ImageIcon className="text-purple-400" />
                        Asset Library
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-4 p-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:outline-none placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredAssets.map(asset => (
                            <div
                                key={asset.id}
                                onClick={() => {
                                    onSelect(asset.url);
                                    onClose();
                                }}
                                className="group relative aspect-video bg-slate-800 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all hover:shadow-xl hover:scale-[1.02]"
                            >
                                <img
                                    src={asset.url}
                                    alt={asset.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <span className="text-white text-xs font-semibold">{asset.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredAssets.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <ImageIcon size={48} className="mb-4 opacity-20" />
                            <p>No assets found</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-600 bg-slate-900 rounded-b-2xl">
                    Select an image to apply it to your scene instantly.
                </div>
            </div>
        </div>
    );
};
