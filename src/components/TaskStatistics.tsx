
import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';

export const TaskStatistics = () => {
  const { tasks, categories } = useTaskContext();
  
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Priority distribution
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' }
  ];
  
  // Category distribution
  const categoryData = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category.id);
    return {
      name: category.name,
      completed: categoryTasks.filter(task => task.completed).length,
      pending: categoryTasks.filter(task => !task.completed).length,
      color: category.color,
    };
  });
  
  // Weekly progress
  const now = new Date();
  const startWeek = startOfWeek(now);
  const endWeek = endOfWeek(now);
  
  const weeklyTasks = tasks.filter(t => 
    t.dueDate && isAfter(new Date(t.dueDate), startWeek) && isBefore(new Date(t.dueDate), endWeek)
  );
  const weeklyComplete = weeklyTasks.filter(t => t.completed).length;
  const weeklyCompletion = weeklyTasks.length > 0 ? Math.round((weeklyComplete / weeklyTasks.length) * 100) : 0;
  
  // Monthly progress
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);
  
  const monthlyTasks = tasks.filter(t => 
    t.dueDate && isAfter(new Date(t.dueDate), startMonth) && isBefore(new Date(t.dueDate), endMonth)
  );
  const monthlyComplete = monthlyTasks.filter(t => t.completed).length;
  const monthlyCompletion = monthlyTasks.length > 0 ? Math.round((monthlyComplete / monthlyTasks.length) * 100) : 0;
  
  // Time trends data
  const timeData = [
    { name: 'Weekly', completion: weeklyCompletion },
    { name: 'Monthly', completion: monthlyCompletion },
    { name: 'Overall', completion: completionRate }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Completion Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-full">
            <div className="mb-6 text-center">
              <div className="text-3xl font-bold">{completionRate}%</div>
              <div className="text-muted-foreground">Overall completion rate</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: completedTasks, color: '#10b981' },
                    { name: 'Pending', value: totalTasks - completedTasks, color: '#6366f1' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Completed', value: completedTasks, color: '#10b981' },
                    { name: 'Pending', value: totalTasks - completedTasks, color: '#6366f1' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Tasks by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" name="Completed" fill="#10b981" />
              <Bar dataKey="pending" stackId="a" name="Pending" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Completion Rates</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
              <Bar dataKey="completion" name="Completion Rate" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
