// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import React from 'react';



// function GoalsItem({ goal }) {
//   const { name, amount, priority, icon, completeBy } = goal;
//   return (
//     <div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//         <Card className="w-[300px] h-[250px] flex flex-col p-4 shadow-md rounded-2xl border">
//           {/* Top Section */}
//           <div className="flex justify-between items-center">
//             <span className="text-2xl">{icon}</span>
//             <Badge
//               className={`text-white px-3 py-1 rounded-md ${
//                 priority === "High"
//                   ? "bg-red-500"
//                   : priority === "Medium"
//                   ? "bg-yellow-500"
//                   : "bg-green-500"
//               }`}
//             >
//               {priority}
//             </Badge>
//           </div>

//           {/* Goal Name & Amount */}
//           <div className="mt-2">
//             <h3 className="text-lg font-semibold">{name}</h3>
//             <p className="text-gray-600 text-sm">₹{amount}</p>
//           </div>

//           {/* Progress Bar */}
//           <div className="mt-3">
//             {/* Placeholder for Progress */}
//             <p className="text-xs text-gray-500 mt-1">Progress: Pending</p>
//           </div>

//           {/* Add Money Button & Due Date */}
//           <div className="mt-4 flex flex-col">
//             <Button variant="outline" className="w-full">
//               Add Money
//             </Button>
//             <p className="text-xs text-gray-500 mt-2">
//               🎯 Complete by: {completeBy}
//             </p>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }

// export default GoalsItem;