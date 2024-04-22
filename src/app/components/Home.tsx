"use client"
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const Home: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<SocketIOClient.Socket>();
    const [peer, setPeer] = useState<SimplePeer.Instance>();

    useEffect(() => {
        const socket = io();
        socketRef.current = socket;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                socketRef.current?.on('message', (message: any) => {
                    if (message.type === 'offer') {
                        // Received an offer
                        const peer = new SimplePeer({ initiator: false, trickle: false, stream });
                        peer.signal(message);
                        setPeer(peer);
                    } else if (message.type === 'answer' && peer) {
                        // Received an answer
                        peer.signal(message);
                    }
                });

                const initiatorPeer = new SimplePeer({ initiator: true, trickle: false, stream });
                setPeer(initiatorPeer);

                initiatorPeer.on('signal', signal => {
                    socketRef.current?.emit('message', signal);
                });

                initiatorPeer.on('stream', stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                });
            })
            .catch(error => console.error('Error accessing media devices:', error));

        return () => {
            socket.disconnect();
            if (peer) {
                peer.destroy();
            }
        };
    }, []);

    return (
        <div>
            <video autoPlay muted ref={videoRef} />
        </div>
    );
};

export default Home;
