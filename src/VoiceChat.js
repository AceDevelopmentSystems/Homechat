import React, { useRef, useState, useEffect } from 'react';
import { isWithinProximity } from './proximity';

// This is a minimal WebRTC + Socket.io signaling client for live voice chat
// For demo: all users join a single room and can hear each other

const SOCKET_URL = 'http://localhost:5000';

function VoiceChat({ username, avatarPosition }) {
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const localStreamRef = useRef();
  const peersRef = useRef({});
  const audioRefs = useRef({});
  const socketRef = useRef();

  // Track nearby users and connected peers
  const [nearby, setNearby] = useState([]);
  const [connectedIds, setConnectedIds] = useState([]);
  const [mutedIds, setMutedIds] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);

  // Send position to backend when changed
  useEffect(() => {
    if (socketRef.current && avatarPosition) {
      socketRef.current.emit('avatar-position', { x: avatarPosition.x, z: avatarPosition.z });
    }
  }, [avatarPosition]);

  // Connect/disconnect peers based on proximity and block list
  useEffect(() => {
    if (!joined) return;
    // Connect to new nearby users (not blocked)
    nearby.forEach(user => {
      if (!connectedIds.includes(user.id) && user.id !== socketRef.current.id && !blockedIds.includes(user.id)) {
        // Initiate connection
        const pc = createPeerConnection(user.id);
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        pc.createOffer().then(offer => {
          pc.setLocalDescription(offer);
          socketRef.current.emit('voice-offer', { to: user.id, offer });
        });
        setConnectedIds(ids => [...ids, user.id]);
      }
    });
    // Disconnect from users no longer nearby or blocked
    connectedIds.forEach(id => {
      if (!nearby.find(u => u.id === id) || blockedIds.includes(id)) {
        if (peersRef.current[id]) {
          peersRef.current[id].close();
          delete peersRef.current[id];
        }
        if (audioRefs.current[id]) {
          audioRefs.current[id].remove();
          delete audioRefs.current[id];
        }
        setConnectedIds(ids => ids.filter(cid => cid !== id));
      }
    });
  }, [nearby, joined, blockedIds]);
  const toggleBlock = (id) => {
    setBlockedIds(blocked => blocked.includes(id) ? blocked.filter(b => b !== id) : [...blocked, id]);
  };

  const joinVoice = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const { io } = await import('socket.io-client');
      socketRef.current = io(SOCKET_URL);
      socketRef.current.emit('join-voice', { username });
      socketRef.current.on('voice-offer', async ({ from, offer }) => {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit('voice-answer', { to: from, answer });
      });
      socketRef.current.on('voice-answer', async ({ from, answer }) => {
        const pc = peersRef.current[from];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });
      socketRef.current.on('voice-candidate', ({ from, candidate }) => {
        const pc = peersRef.current[from];
        if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate));
      });
      socketRef.current.on('voice-join', async ({ id }) => {
        if (id === socketRef.current.id) return;
        const pc = createPeerConnection(id);
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('voice-offer', { to: id, offer });
      });
      socketRef.current.on('nearby-users', (list) => {
        setNearby(list);
      });
      setJoined(true);
    } catch (err) {
      setError('Microphone access denied or not supported.');
    }
  };

  const createPeerConnection = (id) => {
    const pc = new RTCPeerConnection();
    peersRef.current[id] = pc;
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('voice-candidate', { to: id, candidate: event.candidate });
      }
    };
    pc.ontrack = (event) => {
      if (!audioRefs.current[id]) {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audioRefs.current[id] = audio;
        document.body.appendChild(audio);
      }
      audioRefs.current[id].srcObject = event.streams[0];
      audioRefs.current[id].muted = mutedIds.includes(id);
    };
    return pc;
  };

  const leaveVoice = () => {
    setJoined(false);
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    Object.values(audioRefs.current).forEach(audio => audio.remove());
    audioRefs.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const toggleMute = (id) => {
    setMutedIds(muted => {
      const next = muted.includes(id) ? muted.filter(m => m !== id) : [...muted, id];
      if (audioRefs.current[id]) audioRefs.current[id].muted = next.includes(id);
      return next;
    });
  };

  const reportUser = (id, username) => {
    const reason = prompt(`Report ${username}. Please enter a reason:`);
    if (reason && socketRef.current) {
      socketRef.current.emit('report-user', { reportedId: id, reportedUsername: username, reason });
      alert('User reported. Thank you.');
    }
  };

  return (
    <div style={{ margin: '16px 0', textAlign: 'center' }}>
      {joined ? (
        <>
          <button onClick={leaveVoice}>Leave Voice Chat</button>
          <div style={{ fontSize: 13, marginTop: 8 }}>
            Nearby users: {nearby.length > 0 ? (
              nearby.map(u => (
                <span key={u.id} style={{ marginRight: 8 }}>
                  {u.username}
                  <button style={{ marginLeft: 4 }} onClick={() => toggleMute(u.id)}>
                    {mutedIds.includes(u.id) ? 'Unmute' : 'Mute'}
                  </button>
                  <button style={{ marginLeft: 4 }} onClick={() => reportUser(u.id, u.username)}>
                    Report
                  </button>
                  <button style={{ marginLeft: 4 }} onClick={() => toggleBlock(u.id)}>
                    {blockedIds.includes(u.id) ? 'Unblock' : 'Block'}
                  </button>
                </span>
              ))
            ) : 'None'}
          </div>
        </>
      ) : (
        <button onClick={joinVoice}>Join Voice Chat</button>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default VoiceChat;
