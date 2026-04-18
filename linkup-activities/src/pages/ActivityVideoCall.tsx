import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useActivity } from '@/hooks/useActivities';
import { useAuth } from '@/context/AuthContext';
import { startCall, getCall, endCall as endCallApi } from '@/lib/api';
import supabase from '@/lib/supabase';
import { Video, Mic, MicOff, PhoneOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const ActivityVideoCall = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: activity } = useActivity(id!);

  const [callActive, setCallActive] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [remoteReady, setRemoteReady] = useState(false);

  const isHost = !!user && !!activity && user.id === activity.host_id;

  const isHostRef = useRef(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callIdRef = useRef<string | null>(null);

  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { callIdRef.current = callId; }, [callId]);

  // Check for existing active call on mount (both host and participant)
  useEffect(() => {
    if (!id || !user) return;
    getCall(id)
      .then((c) => {
        if (c?.status === 'active') {
          setCallActive(true);
          setCallId(c.id);
        }
      })
      .catch(() => {});
  }, [id, user?.id]);

  // Participant polls every 2s until call goes active
  useEffect(() => {
    if (!id || !user || isHost || callActive) return;
    const t = setInterval(() => {
      getCall(id)
        .then((c) => {
          if (c?.status === 'active') {
            setCallActive(true);
            setCallId(c.id);
          }
        })
        .catch(() => {});
    }, 2000);
    return () => clearInterval(t);
  }, [id, user?.id, isHost, callActive]);

  // Supabase signaling channel
  useEffect(() => {
    if (!id || !user) return;
    const channel = supabase.channel(`video-${id}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;
    channel
      .on('broadcast', { event: 'signal' }, ({ payload }) => {
        handleSignalRef.current(payload);
      })
      .subscribe();
    return () => { channel.unsubscribe(); channelRef.current = null; };
  }, [id, user?.id]);

  const handleSignalRef = useRef<(p: any) => void>(() => {});

  const handleSignal = async (payload: any) => {
    const { type, data } = payload;
    try {
      if (type === 'call-started' && !isHostRef.current) {
        getCall(id!)
          .then((c) => {
            if (c?.status === 'active') { setCallActive(true); setCallId(c.id); }
          })
          .catch(() => {});
        return;
      }

      if (type === 'join' && isHostRef.current) {
        const stream = localStreamRef.current;
        if (!stream) return;
        const pc = createPC();
        pcRef.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        channelRef.current?.send({
          type: 'broadcast', event: 'signal',
          payload: { type: 'offer', data: pc.localDescription },
        });

      } else if (type === 'offer' && !isHostRef.current) {
        const pc = createPC();
        pcRef.current = pc;
        let micStream: MediaStream;
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch {
          toast.error('Microphone permission denied.');
          return;
        }
        localStreamRef.current = micStream;
        micStream.getTracks().forEach((t) => pc.addTrack(t, micStream));
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        channelRef.current?.send({
          type: 'broadcast', event: 'signal',
          payload: { type: 'answer', data: pc.localDescription },
        });
        setJoined(true);

      } else if (type === 'answer' && isHostRef.current) {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data));

      } else if (type === 'candidate' && pcRef.current?.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data));
      }
    } catch (err) {
      console.error('[signal]', err);
    }
  };

  handleSignalRef.current = handleSignal;

  const createPC = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        channelRef.current?.send({
          type: 'broadcast', event: 'signal',
          payload: { type: 'candidate', data: candidate.toJSON() },
        });
      }
    };
    pc.ontrack = (e) => {
      const stream = e.streams?.[0] ?? new MediaStream([e.track]);
      setRemoteReady(true);
      setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play().catch(() => {});
        }
      }, 50);
    };
    return pc;
  };

  // Attach host local video after callActive flips (video element now in DOM)
  useEffect(() => {
    if (isHost && callActive && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [callActive, isHost]);

  const startMeeting = async () => {
    try {
      toast.loading('Requesting camera & mic...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      toast.dismiss();
      const newCall = await startCall(id!);
      setCallId(newCall.id);
      setCallActive(true);
      channelRef.current?.send({
        type: 'broadcast', event: 'signal',
        payload: { type: 'call-started' },
      });
      toast.success('Meeting started');
    } catch (err: any) {
      toast.dismiss();
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') toast.error('Camera/mic permission denied.');
        else if (err.name === 'NotFoundError') toast.error('No camera/mic found.');
        else toast.error(err.message);
      } else {
        toast.error(err?.response?.data?.error || 'Failed to start meeting.');
      }
    }
  };

  const joinCall = () => {
    channelRef.current?.send({
      type: 'broadcast', event: 'signal',
      payload: { type: 'join' },
    });
    toast.info('Connecting...');
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
    setMicOn((v) => !v);
  };

  const endCall = async () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    if (callIdRef.current) {
      try { await endCallApi(callIdRef.current); } catch { /* ignore */ }
    }
    navigate(`/activity/${id}`);
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={endCall}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{activity.title} — Video Call</h1>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] p-4">

        {isHost && !callActive && (
          <div className="text-center space-y-4">
            <p className="text-gray-400">You are the host. Start the meeting when ready.</p>
            <Button onClick={startMeeting} size="lg" className="bg-green-600 hover:bg-green-700">
              <Video className="mr-2 h-5 w-5" /> Start Meeting
            </Button>
          </div>
        )}

        {isHost && callActive && (
          <div className="w-full max-w-2xl space-y-4">
            <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full"
                style={{ height: 480, objectFit: 'cover', backgroundColor: '#000' }} />
            </div>
            <p className="text-center text-sm text-gray-400">Your video · participants can see and hear you</p>
            <div className="flex justify-center gap-4">
              <Button onClick={toggleMic} variant={micOn ? 'default' : 'destructive'} size="lg">
                {micOn ? <Mic className="mr-2 h-5 w-5" /> : <MicOff className="mr-2 h-5 w-5" />}
                {micOn ? 'Mic On' : 'Mic Off'}
              </Button>
              <Button onClick={endCall} variant="destructive" size="lg">
                <PhoneOff className="mr-2 h-5 w-5" /> End Meeting
              </Button>
            </div>
          </div>
        )}

        {!isHost && !callActive && (
          <p className="text-gray-400 text-lg">Waiting for host to start the meeting…</p>
        )}

        {!isHost && callActive && !joined && (
          <div className="text-center space-y-4">
            <p className="text-gray-300 text-lg">Host has started the meeting.</p>
            <Button onClick={joinCall} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Video className="mr-2 h-5 w-5" /> Join Call
            </Button>
          </div>
        )}

        {!isHost && joined && (
          <div className="w-full max-w-2xl space-y-4">
            <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
              {remoteReady ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full"
                  style={{ height: 480, objectFit: 'cover', backgroundColor: '#000' }} />
              ) : (
                <div className="w-full flex items-center justify-center" style={{ height: 480 }}>
                  <p className="text-gray-500">Connecting to host…</p>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-gray-400">Host's video · your mic is {micOn ? 'on' : 'off'}</p>
            <div className="flex justify-center gap-4">
              <Button onClick={toggleMic} variant={micOn ? 'default' : 'destructive'} size="lg">
                {micOn ? <Mic className="mr-2 h-5 w-5" /> : <MicOff className="mr-2 h-5 w-5" />}
                {micOn ? 'Mic On' : 'Mic Off'}
              </Button>
              <Button onClick={endCall} variant="destructive" size="lg">
                <PhoneOff className="mr-2 h-5 w-5" /> Leave Call
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ActivityVideoCall;
