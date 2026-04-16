import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../App.css';

export default function Chat() {
    const [msgs, setMsgs] = useState([
        { role: 'assistant', content: "Hey! 👋 I'm your AI Health Coach. I can look up your workout history, water intake, meal logs — anything in your tracker. Ask me things like \"When did I last complete a workout?\" or \"How much water did I drink today?\"" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBottomRef = useRef(null);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        setMsgs(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const { data: users } = await supabase.from('users').select('id, name').limit(1);
            let userData = { workouts: [], trackers: [] };

            if (users && users.length > 0) {
                const userId = users[0].id;
                const [workoutsRes, trackersRes] = await Promise.all([
                    supabase.from('workouts').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10),
                    supabase.from('daily_trackers').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10)
                ]);
                userData.workouts = workoutsRes.data || [];
                userData.trackers = trackersRes.data || [];
            }

            const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Midula Health App",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "qwen/qwen-2.5-72b-instruct",
                    "messages": [
                        {
                            "role": "system",
                            "content": `You are Midula's AI Health Coach. You provide short, encouraging, and helpful responses. Be warm and use emoji sparingly. Here is the user's recent data:\n${JSON.stringify(userData, null, 2)}\nAnswer questions using this data. If no data exists, encourage them to start tracking!`
                        },
                        ...msgs.map(m => ({ role: m.role, content: m.content })),
                        { "role": "user", "content": userMessage }
                    ]
                })
            });

            if (!response.ok) throw new Error('API error');
            const aiData = await response.json();
            const aiReply = aiData.choices?.[0]?.message?.content || "Sorry, I couldn't process that right now.";
            setMsgs(prev => [...prev, { role: 'assistant', content: aiReply }]);
        } catch (err) {
            console.error(err);
            setMsgs(prev => [...prev, { role: 'assistant', content: "Hmm, I'm having trouble connecting. Make sure your API keys and Supabase are configured! 🔧" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="fade-up fade-up-1" style={{ marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.3rem' }}>AI Health Coach</h1>
                <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>Powered by Qwen 2.5</p>
            </div>

            <div className="chat-messages">
                {msgs.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.role}`}>
                        {m.content}
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-bubble assistant" style={{ display: 'flex', gap: '4px', padding: '1rem 1.2rem' }}>
                        <span style={{ animation: 'fadeUp 0.5s ease infinite alternate', fontSize: '1.2rem' }}>·</span>
                        <span style={{ animation: 'fadeUp 0.5s ease infinite alternate 0.15s', fontSize: '1.2rem' }}>·</span>
                        <span style={{ animation: 'fadeUp 0.5s ease infinite alternate 0.3s', fontSize: '1.2rem' }}>·</span>
                    </div>
                )}
                <div ref={chatBottomRef} />
            </div>

            <div className="chat-input-row">
                <input
                    className="chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="chat-send-btn" onClick={handleSend} disabled={isLoading} style={{ opacity: isLoading ? 0.5 : 1 }}>
                    <Send />
                </button>
            </div>
        </div>
    );
}
