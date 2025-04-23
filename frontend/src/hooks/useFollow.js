import toast from 'react-hot-toast';
import { useQuery , useMutation , useQueryClient } from '@tanstack/react-query';


import React from 'react'

const useFollow = () => {
      
    const queryClient = useQueryClient();
    const{ mutate:follow , isPending } = useMutation({
        mutationFn: async (userId) => {

            try{
            const res = await fetch(`/api/users/follow/${userId}`, {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Something went wrong!");
            }
            return data;}catch (error) { 
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            Promise.all([
            queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
            queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        ]);
        onError: (error) => {
            toast.error(error.message);
        }
},
} );




  return { isPending , follow };
}

export default useFollow;