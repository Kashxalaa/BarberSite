// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://rrcgnssytphudyvgjrce.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2duc3N5dHBodWR5dmdqcmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDgxMDgsImV4cCI6MjA4NTk4NDEwOH0.0Vlds0jAfukc7OwL9nqrxyYjJV3ghLBMMVzQcV-OmFk';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let selectedService = { name: "Haircut Only", price: 30 };
let selectedTime = null;

// Global DOM elements - declare them ONLY here
const langSwitch = document.getElementById('lang-switch');
const dateInput = document.getElementById('booking-date');
const themeToggle = document.getElementById('theme-toggle');
const serviceCards = document.querySelectorAll('.service-card');
const totalDisplay = document.getElementById('total-display');
const timeSlotsContainer = document.getElementById('time-slots');
const finalForm = document.getElementById('final-form');
const submitBtn = document.getElementById('submit-btn');
const timeSection = document.getElementById('time-section');