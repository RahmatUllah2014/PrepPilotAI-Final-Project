import { NoteRecord } from '../types';

export const SAMPLE_LECTURE_TEXT = `Module 4: Computer Operating Systems & Memory Management
Instructor: Prof. Sarah Jenkins | CS 301 Computer Systems Architecture

1. Overview of Operating Systems
An Operating System (OS) acts as an intermediary between the user of a computer and the computer hardware. The primary goals of an OS are to execute user programs, make the computer system convenient to use, and use computer hardware in an efficient manner.

2. Process Management & CPU Scheduling
A process is a program in execution. Process execution must progress in a sequential fashion. A process includes the program code (text section), current activity (program counter, registers), and associated resources (stack, data section, heap).

Key Process States:
- New: The process is being created.
- Running: Instructions are being executed.
- Waiting: The process is waiting for some event to occur (such as an I/O completion).
- Ready: The process is waiting to be assigned to a processor.
- Terminated: The process has finished execution.

CPU Scheduling Algorithms:
- First-Come, First-Served (FCFS): Simple FIFO queue, but subject to the convoy effect.
- Shortest-Job-First (SJF): Optimal for minimizing average waiting time, but difficult to predict CPU burst lengths.
- Round Robin (RR): Designed for time-sharing systems; each process gets a small unit of CPU time (time quantum).
- Priority Scheduling: CPU allocated to the process with highest priority; subject to starvation (solved by aging).

3. Memory Management & Paging
Memory consists of a large array of bytes, each with its own address. CPU fetches instructions from memory according to the program counter.

Virtual Memory & Page Replacement:
Virtual memory separates user logical memory from physical memory. Paging avoids physical memory allocation contiguousness issues.
- Page Fault: Occurs when a page requested by a process is not present in physical RAM memory.
- FIFO Page Replacement: Replaces the oldest page. Can suffer from Belady's Anomaly (more frames -> more page faults).
- LRU (Least Recently Used) Page Replacement: Replaces the page that has not been used for the longest period of time. Considered optimal in practice.

4. Deadlocks
A deadlock is a situation in which two or more processes are unable to proceed because each is waiting for the other to release a resource.
Four Necessary Conditions for Deadlock (Coffman Conditions):
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process holding at least one resource is waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it.
4. Circular Wait: A closed chain of processes exists such that each process holds one or more resources needed by the next process in the chain.

5. File Systems & I/O Systems
File systems organize storage devices into logical structures. Directory trees provide hierarchy, while File Allocation Tables (FAT) or inodes manage block allocation on physical media.`;

export const SAMPLE_NOTES: NoteRecord[] = [
  {
    id: 'sample-cs301',
    userId: 'demo-student',
    title: 'CS 301 - Operating Systems & Memory Management',
    createdAt: new Date().toISOString(),
    fileSize: '2.4 MB',
    pageCount: 12,
    analysis: {
      summary: [
        'An Operating System manages computer hardware and acts as an abstraction layer for user applications.',
        'Processes move through five primary states: New, Ready, Running, Waiting, and Terminated.',
        'CPU Scheduling strategies include FCFS, SJF, Round Robin (RR) time-slicing, and Priority Scheduling.',
        'Virtual Memory uses paging to separate logical address spaces from physical RAM, with LRU being the most effective page replacement algorithm.',
        'Deadlocks require all four Coffman conditions simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.'
      ],
      importantTopics: [
        'Process State Transitions: Understanding Ready vs Waiting state queues and context switching overhead.',
        'Virtual Memory & Paging: How page tables map logical addresses to physical frames and resolve page faults.',
        'The 4 Coffman Deadlock Conditions: Mutual exclusion, hold-and-wait, no-preemption, and circular wait chains.',
        'LRU Page Replacement vs Belady Anomaly: Why FIFO suffers from Belady Anomaly while stack-based LRU does not.',
        'CPU Scheduling Algorithms: Trade-offs between Round Robin time quanta and SJF average wait times.'
      ],
      flashcards: [
        {
          question: 'What is a Process in Operating Systems?',
          answer: 'A program in active execution, including code, program counter, registers, stack, and heap.'
        },
        {
          question: 'What are the 4 Coffman Conditions required for a Deadlock?',
          answer: '1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.'
        },
        {
          question: 'What triggers a Page Fault?',
          answer: 'When a process references a virtual page that is not currently loaded into physical RAM.'
        },
        {
          question: 'What is Belady\'s Anomaly in Page Replacement?',
          answer: 'A phenomenon in FIFO page replacement where increasing physical memory frames results in MORE page faults.'
        },
        {
          question: 'How does Round Robin (RR) CPU scheduling work?',
          answer: 'Processes are assigned fixed CPU time quanta in a cyclic queue, providing fair time-sharing.'
        },
        {
          question: 'What is the purpose of Virtual Memory?',
          answer: 'To allow processes to execute without requiring their entire address space to be contiguously present in physical RAM.'
        }
      ],
      quiz: [
        {
          question: 'Which CPU scheduling algorithm is subject to Belady\'s Anomaly?',
          options: ['LRU (Least Recently Used)', 'FIFO (First-In, First-Out)', 'SJF (Shortest Job First)', 'Optimal Page Replacement'],
          correctAnswer: 'FIFO (First-In, First-Out)'
        },
        {
          question: 'Which condition is NOT a required Coffman condition for deadlocks?',
          options: ['Mutual Exclusion', 'Preemption Enabled', 'Hold and Wait', 'Circular Wait'],
          correctAnswer: 'Preemption Enabled'
        },
        {
          question: 'In process state management, what state does a process enter when awaiting I/O completion?',
          options: ['Ready', 'Terminated', 'Waiting', 'Running'],
          correctAnswer: 'Waiting'
        },
        {
          question: 'What is the main advantage of LRU page replacement over FIFO?',
          options: ['It uses less RAM', 'It eliminates page faults entirely', 'It does not suffer from Belady\'s Anomaly', 'It requires zero hardware tracking'],
          correctAnswer: 'It does not suffer from Belady\'s Anomaly'
        },
        {
          question: 'What component converts virtual page numbers to physical frame numbers?',
          options: ['Page Table', 'Disk Controller', 'Interrupt Vector', 'Kernel Stack'],
          correctAnswer: 'Page Table'
        }
      ],
      simpleExplanation: 'Think of an Operating System as the master conductor of a busy restaurant kitchen. The CPU is the chef, processes are customer orders, and physical RAM is the counter space. The OS makes sure orders get processed fairly without chefs getting stuck waiting forever for clean pans (deadlocks) or running out of counter space (memory paging).',
      studyPlan: [
        'Day 1: Master Process States (Ready, Running, Waiting) and draw state transition diagrams.',
        'Day 2: Calculate CPU scheduling wait times for FCFS, SJF, and Round Robin examples.',
        'Day 3: Memorize the 4 Coffman Deadlock Conditions and practice identifying circular waits.',
        'Day 4: Deep dive into Virtual Memory, Page Tables, and Page Fault resolution mechanics.',
        'Day 5: Practice LRU and FIFO page replacement problems and observe Belady Anomaly.',
        'Day 6: Review file system block allocation methods (FAT vs Inodes).',
        'Day 7: Complete the 10-question self-assessment quiz and review incorrect answers.'
      ]
    }
  },
  {
    id: 'sample-bio101',
    userId: 'demo-student',
    title: 'BIO 101 - Cellular Respiration & ATP Synthesis',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    fileSize: '1.8 MB',
    pageCount: 8,
    analysis: {
      summary: [
        'Cellular respiration converts biochemical energy from nutrients into ATP (Adenosine Triphosphate).',
        'The three primary stages are Glycolysis, the Citric Acid Cycle (Krebs Cycle), and Oxidative Phosphorylation.',
        'Glycolysis occurs in the cytoplasm and does not require oxygen (anaerobic).',
        'The Electron Transport Chain across the inner mitochondrial membrane yields the majority of ATP.'
      ],
      importantTopics: [
        'Glycolysis Mechanics: Conversion of glucose into two pyruvate molecules yielding net 2 ATP.',
        'Krebs Cycle (Citric Acid Cycle): Matrix reactions generating NADH and FADH2 electron carriers.',
        'Chemiosmosis & ATP Synthase: Proton gradient driving ATP synthesis.'
      ],
      flashcards: [
        {
          question: 'Where in the cell does Glycolysis take place?',
          answer: 'In the cytoplasm (cytosol) of the cell.'
        },
        {
          question: 'What is the net ATP yield of Glycolysis per glucose molecule?',
          answer: 'Net yield of 2 ATP molecules (4 produced - 2 consumed).'
        }
      ],
      quiz: [
        {
          question: 'Which stage of cellular respiration produces the most ATP?',
          options: ['Glycolysis', 'Krebs Cycle', 'Oxidative Phosphorylation', 'Fermentation'],
          correctAnswer: 'Oxidative Phosphorylation'
        }
      ],
      simpleExplanation: 'Cellular respiration is how your body transforms food into cellular fuel batteries called ATP. Think of glucose as crude oil and ATP as refined gasoline that powers cellular engines.',
      studyPlan: [
        'Day 1: Draw the full chemical equation of Cellular Respiration.',
        'Day 2: Trace glucose through Glycolysis in the cytoplasm.',
        'Day 3: Study Pyruvate oxidation and entry into the Mitochondrial Matrix.',
        'Day 4: Map out the Citric Acid Cycle inputs and outputs.',
        'Day 5: Master the Electron Transport Chain and proton pump gradients.',
        'Day 6: Compare aerobic respiration with anaerobic fermentation.',
        'Day 7: Run flashcard active recall drill.'
      ]
    }
  }
];
