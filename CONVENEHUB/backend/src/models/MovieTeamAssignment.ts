import { Schema, model } from 'mongoose';

interface MovieTeamAssignmentDocument {
  eventId: string;
  userId: string;
  assignedBy: string;
}

const movieTeamAssignmentSchema = new Schema<MovieTeamAssignmentDocument>(
  {
    eventId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    assignedBy: { type: String, required: true },
  },
  { timestamps: true }
);

movieTeamAssignmentSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const MovieTeamAssignmentModel = model<MovieTeamAssignmentDocument>(
  'MovieTeamAssignment',
  movieTeamAssignmentSchema
);