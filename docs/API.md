# CareerTrack Pro API Documentation

This document outlines the Supabase API endpoints used in CareerTrack Pro. These are not traditional REST endpoints but rather Supabase client library calls that interact with the PostgreSQL database.

## Authentication API

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    data: {
      name: string,
    },
  },
});
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string,
});
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
```

### Get Current Session

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();
```

## Users API

### Get User Profile

```typescript
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("id", userId)
  .single();
```

### Update User Profile

```typescript
const { data, error } = await supabase
  .from("users")
  .update({
    name: string,
  })
  .eq("id", userId);
```

## Job Applications API

### Get All Applications

```typescript
const { data, error } = await supabase
  .from("job_applications")
  .select("*")
  .eq("user_id", userId)
  .order("applied_date", { ascending: false });
```

### Get Application by ID

```typescript
const { data, error } = await supabase
  .from("job_applications")
  .select("*")
  .eq("id", applicationId)
  .eq("user_id", userId)
  .single();
```

### Create Application

```typescript
const { data, error } = await supabase
  .from("job_applications")
  .insert({
    user_id: userId,
    company: string,
    position: string,
    status: "Applied" | "Interviewing" | "Offer" | "Rejected",
    applied_date: string, // ISO date format
    notes: string,
    job_url: string,
    platform: string,
  })
  .select();
```

### Update Application

```typescript
const { data, error } = await supabase
  .from("job_applications")
  .update({
    company: string,
    position: string,
    status: "Applied" | "Interviewing" | "Offer" | "Rejected",
    applied_date: string, // ISO date format
    notes: string,
    job_url: string,
    platform: string,
  })
  .eq("id", applicationId)
  .eq("user_id", userId);
```

### Delete Application

```typescript
const { error } = await supabase
  .from("job_applications")
  .delete()
  .eq("id", applicationId)
  .eq("user_id", userId);
```

## Interviews API

### Get All Interviews

```typescript
const { data, error } = await supabase
  .from("interviews")
  .select("*, job_applications(*)")
  .eq("user_id", userId)
  .order("interview_date", { ascending: true });
```

### Get Interview by ID

```typescript
const { data, error } = await supabase
  .from("interviews")
  .select("*, job_applications(*)")
  .eq("id", interviewId)
  .eq("user_id", userId)
  .single();
```

### Create Interview

```typescript
const { data, error } = await supabase
  .from("interviews")
  .insert({
    user_id: userId,
    application_id: applicationId,
    interview_date: string, // ISO date format
    location: string,
    notes: string,
  })
  .select();
```

### Update Interview

```typescript
const { data, error } = await supabase
  .from("interviews")
  .update({
    interview_date: string, // ISO date format
    location: string,
    notes: string,
  })
  .eq("id", interviewId)
  .eq("user_id", userId);
```

### Delete Interview

```typescript
const { error } = await supabase
  .from("interviews")
  .delete()
  .eq("id", interviewId)
  .eq("user_id", userId);
```

## User Profiles API

### Get User Profile Data

```typescript
const { data, error } = await supabase
  .from("user_profiles")
  .select("*")
  .eq("user_id", userId)
  .single();
```

### Create/Update User Profile Data

```typescript
const { data, error } = await supabase
  .from("user_profiles")
  .upsert({
    user_id: userId,
    full_name: string,
    education: string,
    experience: string,
    skills: string,
    courses: string,
    languages: string,
    projects: string,
    certifications: string,
    summary: string,
  })
  .select();
```

## AI Keys API

### Get AI Keys

```typescript
const { data, error } = await supabase
  .from("ai_keys")
  .select("*")
  .eq("user_id", userId);
```

### Add AI Key

```typescript
const { data, error } = await supabase
  .from("ai_keys")
  .insert({
    user_id: userId,
    name: string,
    key: string,
  })
  .select();
```

### Delete AI Key

```typescript
const { error } = await supabase
  .from("ai_keys")
  .delete()
  .eq("id", keyId)
  .eq("user_id", userId);
```

## Documents API

### Get Documents

```typescript
const { data, error } = await supabase
  .from("documents")
  .select("*")
  .eq("user_id", userId)
  .eq("application_id", applicationId);
```

### Create Document

```typescript
const { data, error } = await supabase
  .from("documents")
  .insert({
    user_id: userId,
    application_id: applicationId,
    type: "resume" | "cover_letter",
    content: string,
  })
  .select();
```

### Delete Document

```typescript
const { error } = await supabase
  .from("documents")
  .delete()
  .eq("id", documentId)
  .eq("user_id", userId);
```

## Error Handling

All API calls should include error handling:

```typescript
try {
  const { data, error } = await supabase.from("table").select("*");
  if (error) throw error;
  // Process data
} catch (error) {
  console.error("Error:", error);
  // Handle error (e.g., show toast notification)
}
```

## Authentication and Security

- All API calls are authenticated using the JWT from the Supabase Auth session
- Row Level Security (RLS) policies ensure users can only access their own data
- The `user_id` field in each table is used to enforce ownership
