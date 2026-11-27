import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cqlqycjmoiuwtdmezprn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbHF5Y2ptb2l1d3RkbWV6cHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3NjQ0MjMsImV4cCI6MjExMTM0MDQyM30.s0eHZ3b5kjFn_pP6fYi1EZYmMTG341zXmWmSDYWaOhE";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase connected:", supabase);