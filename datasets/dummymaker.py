#PROTOTYPE FOR THE DUMMYMAKER 3000

colleges = []
with open('colleges.txt') as my_file:
    for line in my_file:
        line = line.rstrip()
        colleges.append(line)

highschools = []
with open('highschools.txt') as my_file:
    for line in my_file:
        line = line.rstrip()
        highschools.append(line)

sortedHighschools = []
for highschool in highschools:
    temp = highschool.split(",")
    temp = map(lambda x : x.replace("-"," "), temp)
    sortedHighschools.append(list(temp))

import random 

nf = open("dummies.csv", "w+")
nf.write("userid, password,residence_state, high_school_name, high_school_city, high_school_state,GPA, college_class,major_1,major_2, SAT_math, SAT_EBRW, ACT_English, ACT_math, ACT_reading, ACT_science, ACT_composite, SAT_literature, SAT_US_hist, SAT_world_hist, SAT_math_I, SAT_math_II, SAT_eco_bio, SAT_mol_bio, SAT_chemistry, SAT_physics,num_AP_passed\n")
for i in range(50):# change range for number of students
    userid = "dummystudent"+str(i)
    password = "password"
    highschool = sortedHighschools[random.randint(0, len(sortedHighschools) - 1)]
    residence = highschool[2]#state
    high_school_name = highschool[0]
    high_school_city = highschool[1]
    high_school_state = highschool[2]
    gpa = random.randint(1, 4)
    gpa = str(gpa - random.randint(1, 3) / 10)
    college_class = str(random.randint(2019, 2025))
    major_1 = "Math" #heh all math majors
    major_2 = "Art" #Jk they do art too
    sat_math = str(random.randint(200, 800))
    sat_ebrw =str(random.randint(200, 800))
    act_eng = random.randint(1,36)
    act_math = random.randint(1,36)
    act_science = random.randint(1,36)
    act_reading = random.randint(1,36)
    act_comp = str(round((act_eng+act_math+act_science+act_reading) / 4))
    act_eng = str(act_eng)
    act_math = str(act_math)
    act_reading= str(act_reading)
    act_science = str(act_science)
    sat_sub1 = str(random.randint(200, 800))
    sat_sub2 = str(random.randint(200, 800))
    sat_sub3 = str(random.randint(200, 800))
    sat_sub4 = str(random.randint(200, 800))
    sat_sub5 = str(random.randint(200, 800))
    sat_sub6 = str(random.randint(200, 800))
    sat_sub7 = str(random.randint(200, 800))
    sat_sub8 = str(random.randint(200, 800))
    sat_sub9 = str(random.randint(200, 800))
    ap = str(random.randint(0, 10))
    final = userid+","+password+","+residence+","+high_school_name+","+high_school_city+","+high_school_state+","+gpa+","+college_class+","+major_1+","+major_2+","+sat_math+","+sat_ebrw+","+act_eng+","+act_math+","+act_reading+","+act_science+","+act_comp+","+sat_sub1+","+sat_sub2+","+sat_sub3+","+sat_sub4+","+sat_sub5+","+sat_sub6+","+sat_sub7+","+sat_sub8+","+sat_sub9+","+ap+"\n"
    nf.write(final)
    
nf.close()
#now for applications
nf = open('dummyapps.csv', 'w+')
nf.write("userid,college,status\n")
statuses = ["accepted","wait-listed", "pending", "deferred", "withdrawn", "denied"]
for i in range(50):
    userid = "dummystudent"+str(i)
    college1 = "Stony Brook University"
    #college2 = colleges[random.randint(0, len(colleges) - 1)]
    status1 = statuses[random.randint(0, 5)]
    #status2 = statuses[random.randint(0, 5)]
    nf.write(userid+","+college1+","+status1+"\n")
    #nf.write(userid+","+college2+","+status2+"\n")
    
    