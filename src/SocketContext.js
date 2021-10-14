import React, { createContext, useState, useRef, useEffect } from 'react'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'

const SocketContext = createContext()

const socket = io('http://localhost:5000')

const ContextProvider = ({ children }) => {
  // set state of stream
  const [stream, setStream] = useState(null)
  const [me, setMe] = useState('')
  const [call, setCall] = useState({})
  const[callAccepted, setCallAccepted] = useState(false)
  const[callEnded, setCallEnded] = useState(false)

  // set refs used below
  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()

  useEffect(() => {
    // get permission from local device to use camera and mic
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        // gets stream and sets state of stream
        setStream((currentStream))
        // set stream to a ref to populate the video
        myVideo.current.srcObject = currentStream
      })
    // listen for the 'me' action from server
    socket.on('me', (id) => setMe(id))
    // listen for 'calluser' from
    socket.on('calluser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivedCall: true, from, name: callerName, signal })
    })
  // empty array lets useEffect to happen once
  }, [])

  const answerCall = () => {
    setCallAccepted(true)

    const peer = new Peer({initiator: false, trickle: false, stream})

    peer.on('signal', (data) => {
      socket.emit('answercall', { signal: data, to: call.from})
    })

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream
    })
    // call comes from socket 'calluser'
    peer.signal(call.signal)

    connectionRef.current = peer

  }

  const callUser = () => {

  }

  const leaveCall = () => {

  }
}
