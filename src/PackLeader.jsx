import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { Check, CheckCircle, Circle, Plus, Users, ClipboardList, Package, ChevronRight, X, User, Zap, Sun, CloudRain, ShoppingCart, Info, DollarSign, Image, MapPin, Map, PartyPopper } from 'lucide-react';

// --- Mock Data ---
const USERS = {
  'u1': { id: 'u1', name: 'You', avatar: 'https://placehold.co/100x100/A9D5E5/333?text=You' },
  'u2': { id: 'u2', name: 'Robert B.', avatar: 'https://placehold.co/100x100/E5A9A9/333?text=RB' },
  'u3': { id: 'u3', name: 'Timothy N.', avatar: 'https://placehold.co/100x100/A9E5B8/333?text=TN' },
  'u4': { id: 'u4', name: 'Siddhant S.', avatar: 'https://placehold.co/100x100/E5D5A9/333?text=SS' },
  'u5': { id: 'u5', name: 'Bradley Y.', avatar: 'https://placehold.co/100x100/CBA9E5/333?text=BY' },
};

const TEMPLATES = [
  {
    id: 't1',
    name: 'Scout Campout (Weekend)',
    icon: 'Camp',
    description: 'Tents, patrol cooking, and the 10 essentials.',
    gear: [
      { id: 'g1', name: 'Troop Tent', category: 'Shelter', shared: true, quantity: 4 },
      { id: 'g2', name: 'Patrol Tarp/Fly', category: 'Shelter', shared: true, quantity: 2 },
      { id: 'g3', name: 'Patrol Stove', category: 'Cooking', shared: true, quantity: 2 },
      { id: 'g4', name: 'Propane', category: 'Cooking', shared: true, quantity: 4 },
      { id: 'g5', name: 'Patrol Cooking Pots', category: 'Cooking', shared: true, quantity: 2 },
      { id: 'g6', name: 'First Aid Kit', category: 'Safety', shared: true, quantity: 1 },
      { id: 'g7', name: 'Troop Flag', category: 'General', shared: true, quantity: 1 },
      { id: 'g8', name: 'Sleeping Bag', category: 'Personal', shared: false, quantity: 1 },
      { id: 'g9', name: 'Sleeping Pad', category: 'Personal', shared: false, quantity: 1 },
      { id: 'g10', name: 'Rain Gear', category: 'Personal', shared: false, quantity: 1 },
      { id: 'g11', name: 'Pocket Knife', category: 'Personal', shared: false, quantity: 1 },
      // Added a cooler to better match the user story
      { id: 'g11a', name: 'Cooler', category: 'Food', shared: true, quantity: 1 },
    ],
    tasks: [
      { id: 'tk1', name: 'Submit Health Forms A & B', assignedTo: null, status: 'incomplete' },
      { id: 'tk2', name: 'Plan Patrol Menu', assignedTo: null, status: 'incomplete' },
      { id: 'tk3', name: 'Collect Trip Fees', assignedTo: 'u2', status: 'incomplete' },
    ],
  },
  {
    id: 't2',
    name: 'Beach House (Long Weekend)',
    icon: 'Sun',
    description: 'Coordination for a shared Airbnb or VRBO.',
    gear: [
      { id: 'g12', name: 'Cooler', category: 'Food', shared: true, quantity: 2 },
      { id: 'g13', name: 'Beach Towels', category: 'General', shared: true, quantity: 5 },
      { id: 'g14', name: 'Sunscreen (Group)', category: 'Safety', shared: true, quantity: 2 },
      { id: 'g15', name: 'Beach Chairs', category: 'General', shared: true, quantity: 4 },
      { id: 'g16', name: 'Portable Speaker', category: 'General', shared: true, quantity: 1 },
      { id: 'g17', name: 'Groceries (Day 1)', category: 'Food', shared: true, quantity: 1 },
      { id: 'g18', name: 'Swimsuit', category: 'Personal', shared: false, quantity: 1 },
      { id: 'g19', name: 'Personal Toiletries', category: 'Personal', shared: false, quantity: 1 },
    ],
    tasks: [
      { id: 'tk4', name: 'Book Airbnb', assignedTo: 'u1', status: 'complete' },
      { id: 'tk5', name: 'Coordinate carpools', assignedTo: null, status: 'incomplete' },
      { id: 'tk6', name: 'Create music playlist', assignedTo: 'u3', status: 'incomplete' },
    ],
  },
  {
    id: 't3',
    name: 'Surprise Party (Event)',
    icon: 'Party',
    description: 'Coordinate decorations, food, and gifts.',
    gear: [
      { id: 'g20', name: 'Balloons', category: 'Decor', shared: true, quantity: 1 },
      { id: 'g21', name: 'Birthday Cake', category: 'Food', shared: true, quantity: 1 },
      { id: 'g22', name: 'Snacks (Chips, Dips)', category: 'Food', shared: true, quantity: 1 },
      { id: 'g23', name: 'Drinks (Sodas, Water)', category: 'Food', shared: true, quantity: 1 },
      { id: 'g24', name: 'Gift', category: 'General', shared: true, quantity: 1 },
    ],
    tasks: [
      { id: 'tk7', name: 'Send invitations', assignedTo: 'u1', status: 'complete' },
      { id: 'tk8', name: 'Get guest-of-honor out of house', assignedTo: 'u2', status: 'incomplete' },
    ],
  }
];

const TRACKED_ITEMS = [
  { 
    id: 'b1', 
    name: 'Checked Bag 1 (Siddhant)', 
    status: 'At Airport (ATL)', 
    lastSeen: '5m ago',
    location: { top: '45%', left: '35%' }
  },
  { 
    id: 'b2', 
    name: 'Duffel Bag (Robert)', 
    status: 'In Transit to Hotel', 
    lastSeen: '2m ago',
    location: { top: '30%', left: '55%' } 
  },
  { 
    id: 'b3', 
    name: 'Camera Bag (You)', 
    status: 'With You', 
    lastSeen: '1s ago',
    location: { top: '60%', left: '65%' } 
  },
];

// --- React Context for State Management ---
const AppContext = createContext(null);
const CURRENT_USER_ID = 'u1'; // Simulate the "logged in" user

export default function App() {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(true);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  
  // --- NEW: State for completion modal ---
  const [showMyTasksCompleteModal, setShowMyTasksCompleteModal] = useState(false);
  const [myTasksAreDone, setMyTasksAreDone] = useState(false);

  const createTrip = (templateId) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    
    const newTrip = {
      id: `trip_${Date.now()}`,
      name: template.name,
      icon: template.icon,
      participants: Object.values(USERS),
      gear: template.gear.map(g => ({
        ...g,
        claims: g.shared ? Array(g.quantity).fill(null) : [],
        personalStatus: Object.fromEntries(Object.keys(USERS).map(uid => [uid, 'unpacked'])),
      })),
      tasks: template.tasks.map(t => ({ ...t })),
    };
    setCurrentTrip(newTrip);
    setCurrentPage('Dashboard');
    setShowCreateModal(false);
  };
  
  const updateTrip = (updatedData) => {
    setCurrentTrip(prevTrip => ({
      ...prevTrip,
      ...updatedData,
    }));
  };

  // --- NEW: Effect to check for user's task completion ---
  useEffect(() => {
    if (!currentTrip) return;

    // 1. Get all my gear (personal + claimed shared)
    const myGearList = currentTrip.gear.filter(g => {
      const isPersonal = !g.shared;
      const isSharedButClaimedByMe = g.shared && g.claims.includes(CURRENT_USER_ID);
      return isPersonal || isSharedButClaimedByMe;
    });
    
    // 2. Get all my assigned tasks
    const myTasksList = currentTrip.tasks.filter(t => t.assignedTo === CURRENT_USER_ID);

    // 3. Check if all gear is packed
    const allGearPacked = myGearList.every(g => g.personalStatus[CURRENT_USER_ID] === 'packed');
    
    // 4. Check if all tasks are complete
    const allTasksDone = myTasksList.every(t => t.status === 'complete');

    // Must have at least one task/item to be considered "done"
    const hasResponsibilities = (myGearList.length + myTasksList.length) > 0;
    const allDone = allGearPacked && allTasksDone && hasResponsibilities;

    // If I am now done, but wasn't before
    if (allDone && !myTasksAreDone) {
      setShowMyTasksCompleteModal(true); // Show the modal
    }
    
    setMyTasksAreDone(allDone); // Update the state for next check

  }, [currentTrip, myTasksAreDone]); // Watch currentTrip and the state itself

  if (!currentTrip || showCreateModal) {
    return <CreateTripModal onCreateTrip={createTrip} />;
  }

  return (
    <AppContext.Provider 
      value={{ 
        trip: currentTrip, 
        updateTrip,
        currentPage,
        setCurrentPage 
      }}
    >
      <div className="flex h-screen w-full bg-gray-100 font-sans">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Header onNewTrip={() => setShowCreateModal(true)} />
          <MainContent />
        </div>
        
        {/* --- NEW: Render completion modal --- */}
        {showMyTasksCompleteModal && (
          <MyTasksCompleteModal onClose={() => setShowMyTasksCompleteModal(false)} />
        )}
      </div>
    </AppContext.Provider>
  );
}

// --- Modals ---
function CreateTripModal({ onCreateTrip }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Create a New Trip</h2>
        <p className="mb-6 text-gray-600">Start by selecting a template. This will pre-load common gear and tasks for your group.</p>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => onCreateTrip(template.id)}
              className="flex h-full flex-col items-start justify-between rounded-lg border-2 border-gray-200 p-6 text-left transition-all hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <TemplateIcon icon={template.icon} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- NEW: Completion Modal ---
function MyTasksCompleteModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <PartyPopper size={40} />
        </div>
        <h2 className="mt-6 mb-4 text-2xl font-bold text-gray-800">You're All Set!</h2>
        <p className="mb-8 text-gray-600">All your assigned tasks are complete and your bags are packed. You're officially ready for the trip!</p>
        <button
          onClick={onClose}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}


// --- Main Layout Components ---

function Sidebar() {
  const { currentPage, setCurrentPage } = useContext(AppContext);

  const navItems = [
    { name: 'Dashboard', icon: Zap },
    // --- NEW: Progress Tab ---
    { name: 'Progress', icon: Users },
    { name: 'Itinerary', icon: ClipboardList },
    { name: 'Budget', icon: DollarSign },
    { name: 'Tracker', icon: MapPin },
    { name: 'Photos', icon: Image },
  ];
  
  return (
    <nav className="hidden w-64 flex-col border-r border-gray-200 bg-white p-6 md:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Package size={24} />
        </div>
        <span className="text-xl font-bold text-gray-800">PackLeader</span>
      </div>
      
      <ul className="flex-1 space-y-2">
        {navItems.map(item => {
          const isActive = currentPage === item.name;
          return (
            <li key={item.name}>
              <button
                onClick={() => setCurrentPage(item.name)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-auto">
        <button
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100"
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
}

function Header({ onNewTrip }) {
  const { trip } = useContext(AppContext);

  return (
    <header className="flex-shrink-0 border-b border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back, {USERS['u1'].name}. Let's get this trip packed.</p>
        </div>
        <div className="flex items-center gap-4">
          <AvatarStack users={trip.participants} />
          <button 
            onClick={onNewTrip}
            className="mr-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
            New Trip
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
            <Plus size={16} className="mr-1 inline" />
            Invite
          </button>
        </div>
      </div>
    </header>
  );
}

function MainContent() {
  const { currentPage } = useContext(AppContext);

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <DashboardPage />;
      // --- NEW: Render Progress Page ---
      case 'Progress':
        return <ProgressPage />;
      case 'Itinerary':
        return <ItineraryPage />;
      case 'Budget':
        return <BudgetPage />;
      case 'Tracker':
        return <TrackerPage />;
      case 'Photos':
        return <PhotosPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
      {renderPage()}
    </main>
  );
}

// --- PAGE COMPONENTS ---
function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <SharedGearList />
        <PersonalGearList />
      </div>
      <div className="space-y-6 lg:col-span-1">
        <LogisticsCard />
        <TasksList />
      </div>
    </div>
  );
}

// --- NEW: Progress Page Component ---
function ProgressPage() {
  const { trip } = useContext(AppContext);

  const unassignedTasks = useMemo(() => 
    trip.tasks.filter(t => t.assignedTo === null)
  , [trip.tasks]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Everyone's Progress</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trip.participants.map(user => (
          <ParticipantProgressCard key={user.id} user={user} />
        ))}
      </div>
      
      {unassignedTasks.length > 0 && (
        <Card>
          <CardHeader>Unassigned Tasks</CardHeader>
          <div className="space-y-2 p-6 pt-0">
            {unassignedTasks.map(task => (
              <div key={task.id} className="flex items-center rounded-md p-3">
                <Circle size={20} className="mr-3 text-gray-300" />
                <span className="font-medium text-gray-800">{task.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// --- NEW: Sub-component for Progress Page ---
function ParticipantProgressCard({ user }) {
  const { trip } = useContext(AppContext);

  // Get all gear this user is responsible for
  const userGear = useMemo(() => 
    trip.gear.filter(g => {
      const isPersonal = !g.shared && user.id === CURRENT_USER_ID; // Note: We can only see our own personal gear
      const isSharedClaimed = g.shared && g.claims.includes(user.id);
      // For this demo, we'll only show "You" your personal gear.
      // A future update could let users make their personal lists public.
      return user.id === CURRENT_USER_ID ? (isPersonal || isSharedClaimed) : isSharedClaimed;
    })
  , [trip.gear, user.id]);

  // Get all tasks assigned to this user
  const userTasks = useMemo(() => 
    trip.tasks.filter(t => t.assignedTo === user.id)
  , [trip.tasks, user.id]);

  const totalItems = userGear.length + userTasks.length;
  const packedItems = userGear.filter(g => g.personalStatus[user.id] === 'packed').length;
  const completedTasks = userTasks.filter(t => t.status === 'complete').length;
  const totalComplete = packedItems + completedTasks;
  
  const progress = totalItems > 0 ? Math.round((totalComplete / totalItems) * 100) : 100; // 100 if 0 tasks
  
  return (
    <Card>
      <div className="flex items-center gap-4 p-4">
        <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-600">{totalComplete} / {totalItems} Tasks Complete</p>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div 
            className="h-2 rounded-full bg-blue-600 transition-all" 
            style={{ width: `${progress}%`}} 
          />
        </div>
      </div>

      {(userGear.length > 0 || userTasks.length > 0) && (
        <div className="divide-y divide-gray-200 border-t border-gray-200 px-4 pb-4">
          {userGear.map(gear => {
            const isPacked = gear.personalStatus[user.id] === 'packed';
            const myClaimCount = gear.shared ? gear.claims.filter(c => c === user.id).length : 1;
            return (
              <div key={`gear-${gear.id}`} className="flex items-center py-3">
                {isPacked ? <CheckCircle size={18} className="mr-3 text-green-500" /> : <Circle size={18} className="mr-3 text-gray-300" />}
                <span className={`text-sm ${isPacked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                  (Pack) {gear.name} {myClaimCount > 1 ? `(x${myClaimCount})` : ''}
                </span>
              </div>
            );
          })}
          {userTasks.map(task => {
            const isComplete = task.status === 'complete';
            return (
              <div key={`task-${task.id}`} className="flex items-center py-3">
                {isComplete ? <CheckCircle size={18} className="mr-3 text-green-500" /> : <Circle size={18} className="mr-3 text-gray-300" />}
                <span className={`text-sm ${isComplete ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                  (Task) {task.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {totalItems === 0 && (
        <p className="px-4 pb-4 text-sm text-gray-500">No assigned tasks or claimed items.</p>
      )}
    </Card>
  );
}


function ItineraryPage() {
  return (
    <Card>
      <CardHeader>
        <ClipboardList size={18} className="mr-2 text-blue-600" />
        Trip Itinerary
      </CardHeader>
      <div className="p-6">
        <p className="mb-6 text-gray-600">This is where the trip itinerary, schedule, and flight details would go.</p>
        <div className="space-y-4">
          <div className="flex gap-4 rounded-md border border-gray-200 p-4">
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3 font-semibold text-blue-700">Day 1</div>
            <div className="text-gray-700">
              <span className="font-semibold">Travel Day</span><br />
              Arrive at Airbnb, check-in at 3:00 PM. Group dinner at 7:00 PM.
            </div>
          </div>
          <div className="flex gap-4 rounded-md border border-gray-200 p-4">
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3 font-semibold text-blue-700">Day 2</div>
            <div className="text-gray-700">
              <span className="font-semibold">Beach & Bonfire</span><br />
              Morning hike at 9:00 AM, beach in the afternoon, group bonfire at 8:00 PM.
            </div>
          </div>
          <div className="flex gap-4 rounded-md border border-gray-200 p-4">
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3 font-semibold text-blue-700">Day 3</div>
            <div className="text-gray-700">
              <span className="font-semibold">Departure</span><br />
              Check-out at 11:00 AM.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function BudgetPage() {
  return (
    <Card>
      <CardHeader>
        <DollarSign size={18} className="mr-2 text-green-600" />
        Trip Budget
      </CardHeader>
      <div className="p-6">
        <p className="text-gray-600">This is where you could track shared expenses, see who owes what, and link to services like Splitwise.</p>
        <div className="mt-6">
          <div className="flex justify-between rounded-t-lg bg-gray-50 px-4 py-3">
            <span className="font-semibold text-gray-700">Expense</span>
            <span className="font-semibold text-gray-700">Amount</span>
          </div>
          <div className="divide-y divide-gray-200 border-x border-b border-gray-200">
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-600">Airbnb</span>
              <span className="text-gray-800">$1,200.00</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-600">Groceries (Day 1)</span>
              <span className="text-gray-800">$185.50</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-600">Rental Car</span>
              <span className="text-gray-800">$350.00</span>
            </div>
          </div>
          <div className="flex justify-between rounded-b-lg bg-gray-50 px-4 py-3">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">$1,735.50</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PhotosPage() {
  return (
    <Card>
      <CardHeader>
        <Image size={18} className="mr-2 text-purple-600" />
        Shared Photos
      </CardHeader>
      <div className="p-6">
        <p className="mb-6 text-gray-600">This could be a space for a shared photo album where everyone can upload their pictures from the trip.</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <img src="https://placehold.co/300x300/A9D5E5/333?text=Trip+Photo" alt="Placeholder" className="aspect-square rounded-md object-cover" />
          <img src="https://placehold.co/300x300/E5A9A9/333?text=Trip+Photo" alt="Placeholder" className="aspect-square rounded-md object-cover" />
          <img src="https://placehold.co/300x300/A9E5B8/333?text=Trip+Photo" alt="Placeholder" className="aspect-square rounded-md object-cover" />
          <img src="https://placehold.co/300x300/E5D5A9/333?text=Trip+Photo" alt="Placeholder" className="aspect-square rounded-md object-cover" />
        </div>
        <button className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
          <Plus size={16} className="mr-1 inline" />
          Upload Your Photos
        </button>
      </div>
    </Card>
  );
}

function TrackerPage() {
  const [selectedItem, setSelectedItem] = useState(TRACKED_ITEMS[0].id);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <MapPin size={18} className="mr-2 text-red-600" />
            Tracked Gear
          </CardHeader>
          <div className="flex flex-col p-4 pt-0">
            {TRACKED_ITEMS.map(item => {
              const isSelected = selectedItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`mb-2 rounded-lg border-2 p-4 text-left transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    {item.status === 'With You' ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">With You</span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">In Transit</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.status}</p>
                  <p className="mt-1 text-xs text-gray-400">Last seen: {item.lastSeen}</p>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
            <img
              src="https://placehold.co/1200x800/e2e8f0/a0aec0?text=Live+Gear+Map+(Simulation)"
              alt="Simulation of a map"
              className="h-full w-full object-cover"
            />
            
            {TRACKED_ITEMS.map(item => {
              const isSelected = selectedItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className="group absolute -translate-x-1/2 -translate-y-full transform transition-all"
                  style={{ top: item.location.top, left: item.location.left, zIndex: isSelected ? 10 : 1 }}
                >
                  <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-3 py-1 text-sm text-white shadow-lg transition-all ${
                    isSelected ? 'scale-100' : 'scale-0 group-hover:scale-100'
                  }`}>
                    {item.name}
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                  </div>
                  
                  <MapPin 
                    className={`transition-all ${
                      isSelected ? 'h-10 w-10 text-blue-600' : 'h-8 w-8 text-red-600 hover:text-red-500'
                    }`} 
                    fill="currentColor" 
                  />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}


// --- Core Feature Components ---

function SharedGearList() {
  const { trip, updateTrip } = useContext(AppContext);
  
  const sharedGear = useMemo(() => 
    trip.gear.filter(g => g.shared)
  , [trip.gear]);
  
  const handleAssignment = (gearId, claimIndex, userId) => {
    const newGear = trip.gear.map(g => {
      if (g.id === gearId) {
        const newClaims = [...g.claims];
        newClaims[claimIndex] = userId; 
        return { ...g, claims: newClaims };
      }
      return g;
    });
    updateTrip({ gear: newGear });
  };
  
  const getGearStatus = (gear) => {
    const total = gear.quantity;
    const claimed = gear.claims.filter(c => c !== null).length;
    if (claimed === 0) return { text: 'Unclaimed', color: 'text-red-500' };
    if (claimed < total) return { text: `${claimed}/${total} Claimed`, color: 'text-yellow-600' };
    return { text: 'All Claimed', color: 'text-green-600' };
  };

  return (
    <Card>
      <CardHeader>
        <Package size={18} className="mr-2 text-blue-600" />
        Shared Gear
      </CardHeader>
      <div className="space-y-4 p-6">
        {sharedGear.map(gear => (
          <div key={gear.id} className="rounded-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">{gear.name}</h4>
                <p className="text-sm text-gray-500">{gear.category}</p>
              </div>
              <span className={`text-sm font-medium ${getGearStatus(gear).color}`}>
                {getGearStatus(gear).text}
              </span>
            </div>
            
            <div className="mt-4 flex flex-col gap-3">
              {gear.claims.map((claimantId, index) => {
                const isClaimedByMe = claimantId === CURRENT_USER_ID;
                const isClaimed = claimantId !== null;
                
                return (
                  <div key={index} className="flex flex-wrap items-center justify-between rounded-md bg-gray-50 p-2 sm:flex-nowrap">
                    <div className="flex items-center gap-3">
                        {isClaimed ? (
                            <img src={USERS[claimantId].avatar} alt={USERS[claimantId].name} className="h-8 w-8 rounded-full" />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                                <Circle size={16} className="text-gray-400" />
                            </div>
                        )}
                        
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">
                                {isClaimed ? (isClaimedByMe ? "You" : USERS[claimantId].name) : "Unclaimed Slot"}
                            </span>
                            {isClaimedByMe && <span className="text-xs text-blue-600">Appears in your packing list</span>}
                        </div>
                    </div>

                    <select
                        className={`mt-2 w-full rounded border py-1 pl-2 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:w-auto ${
                             isClaimedByMe ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300'
                        }`}
                        value={claimantId || ""}
                        onChange={(e) => handleAssignment(gear.id, index, e.target.value || null)}
                    >
                        <option value="">Needs Volunteer</option>
                        <optgroup label="Assign To...">
                            {Object.values(USERS).map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.id === CURRENT_USER_ID ? "Me (Claim)" : u.name}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PersonalGearList() {
  const { trip, updateTrip } = useContext(AppContext);
  
  const myGearList = useMemo(() => 
    trip.gear.filter(g => {
      const isPersonal = !g.shared;
      const isSharedButClaimedByMe = g.shared && g.claims.includes(CURRENT_USER_ID);
      return isPersonal || isSharedButClaimedByMe;
    })
  , [trip.gear]);
  
  const handleTogglePacked = (gearId) => {
    const newGear = trip.gear.map(g => {
      if (g.id === gearId) {
        const myStatus = g.personalStatus[CURRENT_USER_ID];
        const newStatus = myStatus === 'packed' ? 'unpacked' : 'packed';
        return {
          ...g,
          personalStatus: {
            ...g.personalStatus,
            [CURRENT_USER_ID]: newStatus,
          },
        };
      }
      return g;
    });
    updateTrip({ gear: newGear });
  };
  
  const packedCount = myGearList.filter(g => g.personalStatus[CURRENT_USER_ID] === 'packed').length;
  const totalCount = myGearList.length;
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
                <User size={18} className="mr-2 text-green-600" />
                <span>Your Packing List</span>
            </div>
            <span className="text-sm font-normal text-gray-500">{packedCount}/{totalCount} Packed ({progress}%)</span>
        </div>
      </CardHeader>
      <div className="space-y-2 p-6 pt-0">
        {myGearList.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">You haven't claimed any items yet.</p>
        )}
        {myGearList.map(gear => {
          const isPacked = gear.personalStatus[CURRENT_USER_ID] === 'packed';
          const myClaimCount = gear.shared ? gear.claims.filter(c => c === CURRENT_USER_ID).length : 1;
          
          return (
            <button
              key={gear.id}
              onClick={() => handleTogglePacked(gear.id)}
              className={`flex w-full items-center justify-between rounded-md p-3 transition-colors ${
                isPacked ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {isPacked ? (
                  <CheckCircle size={20} className="mr-3 text-green-500" />
                ) : (
                  <Circle size={20} className="mr-3 text-gray-300" />
                )}
                <div className="text-left">
                    <span className={`block font-medium ${isPacked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {gear.name} {myClaimCount > 1 ? `(x${myClaimCount})` : ''}
                    </span>
                    {gear.shared && <span className="text-xs text-blue-500">Shared Item {myClaimCount > 1 ? `(You claimed ${myClaimCount})` : ''}</span>}
                </div>
              </div>
              <span className="text-sm text-gray-500">{gear.category}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}


function TasksList() {
  const { trip, updateTrip } = useContext(AppContext);

  const handleToggleTask = (taskId) => {
    const newTasks = trip.tasks.map(t => {
      if (t.id === taskId) {
        if (t.assignedTo === null || t.assignedTo === CURRENT_USER_ID) {
          return { ...t, status: t.status === 'complete' ? 'incomplete' : 'complete' };
        }
      }
      return t;
    });
    updateTrip({ tasks: newTasks });
  };

  return (
    <Card>
      <CardHeader>
        <ClipboardList size={18} className="mr-2 text-yellow-600" />
        Trip Tasks
      </CardHeader>
      <div className="space-y-2 p-6 pt-0">
        {trip.tasks.map(task => {
          const isComplete = task.status === 'complete';
          const assignedUser = task.assignedTo ? USERS[task.assignedTo] : null;
          const canToggle = !assignedUser || assignedUser.id === CURRENT_USER_ID;
          
          return (
            <button
              key={task.id}
              onClick={() => canToggle && handleToggleTask(task.id)}
              disabled={!canToggle}
              className={`flex w-full items-center justify-between rounded-md p-3 transition-colors ${
                isComplete ? 'bg-green-50' : (canToggle ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-70')
              }`}
            >
              <div className="flex items-center">
                {isComplete ? (
                  <CheckCircle size={20} className="mr-3 text-green-500" />
                ) : (
                  <Circle size={20} className="mr-3 text-gray-300" />
                )}
                <span className={`text-left font-medium ${isComplete ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {task.name}
                </span>
              </div>
              {assignedUser && (
                <img src={assignedUser.avatar} alt={assignedUser.name} className="h-6 w-6 rounded-full" title={`Assigned to ${assignedUser.name}`} />
              )}
              {!assignedUser && !isComplete && (
                <span className="text-xs font-semibold text-gray-500">Unassigned</span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function LogisticsCard() {
  const logistics = [
    { icon: Sun, text: 'Weather: 15-25°C, Sunny' },
    { icon: CloudRain, text: 'Rain expected Tuesday' },
    { icon: Info, text: 'No laundry at Airbnb' },
    { icon: ShoppingCart, text: 'Grocery store 5km away' },
  ];

  return (
    <Card>
      <CardHeader>
        <Info size={18} className="mr-2 text-purple-600" />
        Trip Logistics
      </CardHeader>
      <div className="space-y-3 p-6 pt-0">
        {logistics.map((item, index) => (
          <div key={index} className="flex items-center">
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{item.text}</span>
          </div>
        ))}
        <p className="!mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          <strong>Heads up:</strong> Since there's no laundry, you might want to pack extra socks!
        </p>
      </div>
    </Card>
  );
}


// --- Reusable UI Components ---
function AvatarStack({ users }) {
  const maxAvatars = 4;
  const displayedUsers = users.slice(0, maxAvatars);
  const hiddenCount = users.length - maxAvatars;

  return (
    <div className="flex -space-x-2">
      {displayedUsers.map((user) => (
        <img
          key={user.id}
          className="inline-block h-10 w-10 rounded-full border-2 border-white"
          src={user.avatar}
          alt={user.name}
          title={user.name}
        />
      ))}
      {hiddenCount > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-sm font-medium text-gray-700">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return (
    <h3 className="flex items-center border-b border-gray-200 p-4 text-lg font-semibold text-gray-900">
      {children}
    </h3>
  );
}

function TemplateIcon({ icon }) {
  switch (icon) {
    case 'Camp': return <Package size={24} />;
    case 'Sun': return <Sun size={24} />;
    case 'Party': return <Users size={24} />;
    default: return <Package size={24} />;
  }
}
