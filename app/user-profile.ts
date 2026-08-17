export type ContactPreference="email"|"whatsapp"|"telegram";

export type UserProfileData={
  fullName:string;
  currentName:string;
  birthDate:string;
  birthHour:string;
  birthMinute:string;
  birthCountry:string;
  birthCity:string;
  currentCountry:string;
  currentCity:string;
  timezone:string;
  calendar:"solar"|"lunar";
  gender:string;
  whatsapp:string;
  telegram:string;
  preferredContact:ContactPreference;
  personalizationConsent:boolean;
  updatedAt:string;
};

export const emptyUserProfile:UserProfileData={fullName:"",currentName:"",birthDate:"",birthHour:"",birthMinute:"00",birthCountry:"",birthCity:"",currentCountry:"",currentCity:"",timezone:"America/Mexico_City",calendar:"solar",gender:"",whatsapp:"",telegram:"",preferredContact:"email",personalizationConsent:false,updatedAt:""};

export function normalizeUserProfile(value:unknown,name=""):UserProfileData{const source=value&&typeof value==="object"?value as Partial<UserProfileData>:{};return{...emptyUserProfile,...source,fullName:source.fullName||name,calendar:source.calendar==="lunar"?"lunar":"solar",preferredContact:["email","whatsapp","telegram"].includes(source.preferredContact||"")?source.preferredContact as ContactPreference:"email",personalizationConsent:source.personalizationConsent===true}}

export function isAstroProfileComplete(profile:UserProfileData){return Boolean(profile.fullName&&profile.birthDate&&profile.birthHour&&profile.birthCountry&&profile.birthCity&&profile.timezone)}
