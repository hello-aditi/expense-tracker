"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "utils/dbConfig";
import { Goals } from "utils/schema";
import { toast } from "sonner";

function CreateGoals({ refreshData }) {
  const { user } = useUser();
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("");

  const onCreateGoal = async () => {
    try {
      const result = await db
        .insert(Goals)
        .values({
          name: name,
          amount: amount,
          date: new Date(),
          completeBy: new Date(date + "T00:00:00Z"),
          priority: priority,
          icon: emojiIcon,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        })
        .returning({ insertedId: Goals.id });

      if (result) {
        refreshData();
        toast("New Goal Added!!");
        setName("");
        setAmount("");
        setDate("");
        setPriority("");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast("Failed to create goal.");
    }
  };

  return (
    <div className="mt-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button className=" hover:bg-fuchsia-700 text-white shadow-lg text-lg font-bold">
            + Add Goal
          </Button>
        </DialogTrigger>

        <DialogContent className="shadow-lg border border-fuchsia-200">
          <DialogHeader>
            <DialogTitle className="text-fuchsia-700">Enter your Goal</DialogTitle>
            <DialogDescription>Fill the details below to create a goal.</DialogDescription>
          </DialogHeader>

          {/* Emoji Picker */}
          <div className="mt-5">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
              className="border-fuchsia-300"
            >
              {emojiIcon}
            </Button>
            {openEmojiPicker && (
              <div className="absolute z-20">
                <EmojiPicker
                  onEmojiClick={(e) => {
                    setEmojiIcon(e.emoji);
                    setOpenEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Goal Name */}
          <div className="mt-2">
            <h2 className="text-fuchsia-700 font-medium my-1">Goal Name</h2>
            <Input
              placeholder="e.g. Phone"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>

          {/* Amount */}
          <div className="mt-1">
            <h2 className="text-fuchsia-700 font-medium my-1">Enter Goal Amount</h2>
            <Input
              type="number"
              placeholder="e.g. 10,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>

          {/* Deadline Date */}
          <div className="mt-1">
            <h2 className="text-fuchsia-700 font-medium my-1">Complete Goal By</h2>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>

          {/* Priority Dropdown */}
          <div className="mt-1">
            <h2 className="text-fuchsia-700 font-medium my-1">Priority Level</h2>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-500">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Goal Button */}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                disabled={!(name && amount && date && priority)}
                onClick={onCreateGoal}
                className="mt-5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
              >
                Add Goal
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateGoals;