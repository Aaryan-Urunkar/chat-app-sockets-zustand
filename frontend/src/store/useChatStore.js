import { create } from "zustand";
import {toast} from "react-hot-toast"
import { axiosInstance } from "../lib/axios";
import {useAuthStore} from "./useAuthStore.js"

export const useChatStore = create((set, get) =>({
    messages : [],
    users : [],
    selectedUser : null,
    isUsersLoading : false,
    isMessagesLoading : false,
    // onlineUsers : [],

    getUsers: async() => {
        set({isUsersLoading : true})
        try{
            const res = await axiosInstance.get("/messages/users")
            set({users : res.data})
        }catch(e){
            toast.error(error.response.data.message)
        }finally{
            set({isUsersLoading : false})
        }
    },

    getMessages : async(userId) => {
        set({isMessagesLoading : true})
        try{
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({messages : res.data})
        }catch(e){
            toast.error(error.response.data.message)
        }finally{
            set({isMessagesLoading : false})
        }
    },
    //todo : optimizer this later
    sendMessage: async(messageData) =>{
        const {selectedUser , messages} = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}` , messageData)
            console.log(res);
            
            set({messages : [...messages , res.data]})
            return res
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },
    subscribeToMessages : () => {
        const {selectedUser} = get()
        if(!selectedUser) return

        const socket = useAuthStore.getState().socket

        //todo : optimize this one later
        socket.on("newMessage" , (newMessage) =>{
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            set({messages :[...get().messages , newMessage]})
        })
    },
    unsubscribeFromMessages : () => {
        
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")
    },

    setSelectedUser : (selectedUser) =>{
        set({selectedUser : selectedUser})
    },
}))