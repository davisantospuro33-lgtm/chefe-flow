import React, { useState } from 'react';
import { Send, X, Sparkles, Mic, Image as ImageIcon, Smile, Bot, CheckCircle } from 'lucide-react';

interface ChatCeochefeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatCeochefe: React.FC<ChatCeochefeProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ceochefe',
      text: 'Salve! Aqui é o CEOCHEFE 🤝 Consulto o salão em tempo real: status da casa, encaixe virtual, horários da agenda e tempo de espera. O que você precisa?',
      time: '13:45'
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Resposta inteligente do CEOCHEFE integrada ao painel
    setTimeout(() => {
      let botResponse = "Entendido! Puxando dados do painel do salão...";
      
      const lower = text.toLowerCase();
      if (lower.includes('como está o salão') || lower.includes('fila')) {
        botResponse = "🟢 Status atualizado do Painel: Salão tranquilo. 0 pessoas na fila presencial. Pode colar!";
      } else if (lower.includes('encaixe') || lower.includes('fila de encaixe')) {
        botResponse = "⚡ Encaixe Virtual liberado! Zero espera. Clique no botão de encaixe na tela principal para garantir sua senha.";
      } else if (lower.includes('horário') || lower.includes('agenda')) {
        botResponse = "📅 A agenda de hoje possui vagas abertas nos horários das 14:30, 16:00 e 18:30.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ceochefe',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-md h-[90vh] sm:h-[600px] bg-[#0b0f19] border border-white/10 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER DO CHAT HÍBRIDO (RECEPCIONISTA DE ELITE) */}
        <div className="p-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100" 
                alt="CEOCHEFE" 
                className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0b0f19] rounded-full"></span>
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                CEOCHEFE <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-mono">IA ELITE</span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online • Sincronizado ao Painel
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SUGESTÕES RÁPIDAS DE ATENDIMENTO */}
        <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => handleSend("Como está o salão agora?")}
            className="text-[11px] bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/10 px-3 py-1.5 rounded-full text-gray-300 whitespace-nowrap transition-all"
          >
            📊 Como está o salão agora?
          </button>
          <button 
            onClick={() => handleSend("Quero entrar no encaixe")}
            className="text-[11px] bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/10 px-3 py-1.5 rounded-full text-gray-300 whitespace-nowrap transition-all"
          >
            ⚡ Quero entrar no encaixe
          </button>
          <button 
            onClick={() => handleSend("Ver horários disponíveis")}
            className="text-[11px] bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/10 px-3 py-1.5 rounded-full text-gray-300 whitespace-nowrap transition-all"
          >
            📅 Ver horários disponíveis
          </button>
        </div>

        {/* CORPO DE MENSAGENS (ESTILO WHATSAPP/TELEGRAM) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#070a12]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-600/10' 
                  : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
              }`}>
                <p>{msg.text}</p>
                <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT DE MENSAGEM */}
        <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center gap-2">
          <button className="text-gray-400 hover:text-white p-2 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mensagem para o CEOCHEFE ou o Barbeiro..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button 
            onClick={() => handleSend()}
            className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
