import React, { useState } from 'react';
import {
    ChevronDown,
    MessageCircle,
    Users,
    Shield,
    Zap,
    MapPin,
    Star,
    Clock,
    AlertCircle,
    Mail,
    Phone,
    ArrowLeft,
} from 'lucide-react';

interface HelpViewProps {
    userRole?: 'user' | 'artisan';
    onBack: () => void;
}

const FAQItem = ({ question, answer, icon: Icon }: {
    question: string;
    answer: string;
    icon: React.ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className="group cursor-pointer mb-3 last:mb-0"
        >
            <div
                className={`p-4 rounded-2xl transition-all duration-300 border ${
                    isOpen
                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`mt-1 transition-all ${
                            isOpen ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                    >
                        {Icon}
                    </div>
                    <div className="flex-1">
                        <h3
                            className={`font-bold text-sm transition-colors ${
                                isOpen ? 'text-white' : 'text-slate-200'
                            }`}
                        >
                            {question}
                        </h3>
                    </div>
                    <ChevronDown
                        size={20}
                        className={`text-slate-500 transition-transform duration-300 flex-shrink-0 mt-1 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>

                {isOpen && (
                    <div className="mt-4 ml-9 text-sm text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                        {answer}
                    </div>
                )}
            </div>
        </div>
    );
};

const ContactCard = ({ icon: Icon, title, value, href }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    href?: string;
}) => {
    const content = (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-400/30 hover:border-indigo-400/60 transition-all hover:shadow-lg hover:shadow-indigo-500/20 group">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                    {Icon}
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">{title}</p>
                    <p className="text-sm font-bold text-white mt-0.5">{value}</p>
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer">
                {content}
            </a>
        );
    }
    return content;
};

export const HelpView: React.FC<HelpViewProps> = ({ userRole, onBack }) => {
    const [activeTab, setActiveTab] = useState<'client' | 'artisan' | 'general'>('general');

    const generalFAQ = [
        {
            question: 'Qu\'est-ce que Vork ?',
            answer: 'Vork est une plateforme de marketplace qui connecte les clients avec des artisans qualifiés pour tous vos travaux de maison. Trouvez rapidement un professionnel fiable près de chez vous.',
            icon: <Zap size={18} />,
        },
        {
            question: 'Comment fonctionne l\'appli ?',
            answer: 'Créez un compte, décrivez votre besoin, consultez les artisans disponibles, discutez en direct via chat, et recevez des devis. Une fois d\'accord, l\'artisan intervient et vous pouvez laisser un avis après.',
            icon: <Users size={18} />,
        },
        {
            question: 'Est-ce sécurisé ?',
            answer: 'Oui, nous vérifions les profils des artisans, les avis sont authentiques, et vous pouvez communiquer de manière sécurisée. Vos données personnelles sont protégées.',
            icon: <Shield size={18} />,
        },
        {
            question: 'Quel est le coût ?',
            answer: 'L\'app est gratuite pour les clients. Les tarifs des artisans sont affichés directement. Aucun frais caché, vous négociez directement avec le professionnel.',
            icon: <AlertCircle size={18} />,
        },
    ];

    const clientFAQ = [
        {
            question: 'Comment créer une demande ?',
            answer: 'Cliquez sur le bouton + en bas de l\'écran, décrivez votre besoin, choisissez une catégorie, et indiquez votre localisation. Les artisans proches recevront votre demande.',
            icon: <Zap size={18} />,
        },
        {
            question: 'Comment voir les artisans disponibles ?',
            answer: 'Utilisez la recherche pour filtrer par catégorie, notation, et distance. Chaque profil affiche l\'expérience, les avis, et le portfolio. Vous pouvez aussi consulter les favoris.',
            icon: <MapPin size={18} />,
        },
        {
            question: 'Comment communiquer avec un artisan ?',
            answer: 'Cliquez sur "Contacter" depuis le profil. Un chat privé s\'ouvre où vous pouvez discuter directement. Les messages sont en temps réel et vous verrez si l\'artisan est en ligne.',
            icon: <MessageCircle size={18} />,
        },
        {
            question: 'Comment évaluer un artisan ?',
            answer: 'Après chaque mission, vous pouvez laisser une note (1-5 étoiles) et un commentaire. Vos avis aident les autres clients à trouver les meilleurs artisans.',
            icon: <Star size={18} />,
        },
        {
            question: 'Comment annuler une commande ?',
            answer: 'Si personne n\'a encore accepté, vous pouvez supprimer votre demande. Une fois acceptée par un artisan, contactez-le directement pour annuler.',
            icon: <AlertCircle size={18} />,
        },
    ];

    const artisanFAQ = [
        {
            question: 'Comment créer mon profil artisan ?',
            answer: 'Inscrivez-vous en tant qu\'artisan, remplissez vos coordonnées, ajoutez vos services et catégories. Téléchargez des photos de vos réalisations pour montrer votre portfolio.',
            icon: <Users size={18} />,
        },
        {
            question: 'Comment recevoir des demandes ?',
            answer: 'Une fois votre profil complet, vous recevrez des demandes correspondant à vos services. Plus votre profil est détaillé et vos avis bons, plus vous recevrez de demandes.',
            icon: <Clock size={18} />,
        },
        {
            question: 'Comment accepter une mission ?',
            answer: 'Consultez le détail de la demande, discutez avec le client via chat pour comprendre le besoin, négociez le prix, puis acceptez la mission. Le client sera notifié immédiatement.',
            icon: <Zap size={18} />,
        },
        {
            question: 'Comment gérer mon statut en ligne ?',
            answer: 'Activez/désactivez "En ligne" depuis votre profil. Les clients verront votre disponibilité. Pensez à le mettre à jour régulièrement pour ne pas manquer de demandes.',
            icon: <MapPin size={18} />,
        },
        {
            question: 'Comment augmenter mes chances d\'être contacté ?',
            answer: 'Maintenez une bonne notation, répondez rapidement aux messages, mettez à jour votre portfolio avec de belles photos, et soyez professionnel. Les artisans bien évalués remontent dans les résultats.',
            icon: <Star size={18} />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white pb-20">
            {/* Back Button & Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
                <div className="px-4 pt-4 pb-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-bold">Retour</span>
                    </button>
                    <h1 className="text-lg font-black tracking-tighter">AIDE & SUPPORT</h1>
                    <div className="w-10" /> {/* Spacer for balance */}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {/* Hero Section */}
                <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-indigo-500/20 border border-purple-400/30 text-center">
                    <div className="text-4xl mb-3">🛠️</div>
                    <h2 className="text-xl font-black mb-2">Besoin d\'aide ?</h2>
                    <p className="text-sm text-slate-300">
                        Trouvez réponses et conseils pour bien utiliser Vork
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            activeTab === 'general'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Général
                    </button>
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            activeTab === 'client'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Client
                    </button>
                    <button
                        onClick={() => setActiveTab('artisan')}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            activeTab === 'artisan'
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Artisan
                    </button>
                </div>

                {/* FAQ Content */}
                <div className="mb-8">
                    {activeTab === 'general' && (
                        <div className="space-y-0">
                            {generalFAQ.map((item, idx) => (
                                <FAQItem
                                    key={idx}
                                    question={item.question}
                                    answer={item.answer}
                                    icon={item.icon}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'client' && (
                        <div className="space-y-0">
                            {clientFAQ.map((item, idx) => (
                                <FAQItem
                                    key={idx}
                                    question={item.question}
                                    answer={item.answer}
                                    icon={item.icon}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'artisan' && (
                        <div className="space-y-0">
                            {artisanFAQ.map((item, idx) => (
                                <FAQItem
                                    key={idx}
                                    question={item.question}
                                    answer={item.answer}
                                    icon={item.icon}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact Section */}
                <div className="mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                        Nous contacter
                    </h3>
                    <div className="space-y-2">
                        <ContactCard
                            icon={<Mail size={18} className="text-indigo-400" />}
                            title="Email"
                            value="support@vork.app"
                            href="mailto:support@vork.app"
                        />
                        <ContactCard
                            icon={<MessageCircle size={18} className="text-indigo-400" />}
                            title="Chat Support"
                            value="Disponible 24/7"
                        />
                    </div>
                </div>

                {/* Tips Section */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/30">
                    <div className="flex gap-3">
                        <div className="text-xl flex-shrink-0">💡</div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                                Conseil
                            </p>
                            <p className="text-xs text-slate-400">
                                Consultez régulièrement vos messages et maintenez votre profil à jour pour une meilleure expérience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
