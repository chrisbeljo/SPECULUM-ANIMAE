"use client";

import { useCallback,useEffect,useState } from "react";
import { supabase } from "../supabase";
import { emptyUserProfile,normalizeUserProfile,type UserProfileData } from "../user-profile";
import { useAuth } from "./useAuth";

export function useUserProfile(){
  const {user}=useAuth();
  const [profile,setProfile]=useState<UserProfileData>(emptyUserProfile);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  const load=useCallback(async()=>{if(!user){setProfile(emptyUserProfile);setLoading(false);return}setLoading(true);setError("");const {data,error:queryError}=await supabase.from("users").select("nombre, perfil_datos").eq("id",user.id).maybeSingle();if(queryError){setError(queryError.message);setLoading(false);return}setProfile(normalizeUserProfile(data?.perfil_datos,data?.nombre||user.user_metadata?.nombre||""));setLoading(false)},[user]);

  useEffect(()=>{void load()},[load]);

  const save=async(next:UserProfileData)=>{if(!user)throw new Error("No hay una sesión activa");const stored={...next,updatedAt:new Date().toISOString()};const {error:saveError}=await supabase.from("users").upsert({id:user.id,email:user.email,nombre:stored.fullName,perfil_datos:stored},{onConflict:"id"});if(saveError)throw saveError;setProfile(stored);return stored};

  return{user,profile,loading,error,save,reload:load};
}
