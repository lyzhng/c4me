import pandas as pd

df = pd.read_csv('college_data.csv', na_values=['NULL'])
df.to_csv('filtered_columns.csv', columns=['INSTNM', 'CITY', 'STABBR', 'ZIP', 'INSTURL', 'ADM_RATE', 'TUITIONFEE_IN', 'TUITIONFEE_OUT', 'SATVR25', 'SATVR75', 'SATMT25', 'SATMT75', 'SATWR25', 'SATWR75', 'SATVRMID', 'SATMTMID', 'SATRMID', 'ACTCM25', 'ACTCM75', 'ACTEN25', 'ACTEN75', 'ACTMT25', 'ACTM75', 'ACTWR25', 'ACTWR75', 'ACTCMMID', 'ACTENMID', 'ACTMTMID', 'ACTWRMID', 'SAT_AVG'])
desired = pd.read_csv('filtered_columns.csv')
# COSTT4_A, COSTT4_P (cost of attendance/program)
# NPT4_PUB (PT41_*, NPT42_*, NPT43_*, NPT44_*, and NPT45_* for _PUB and _PRIV) (net price)
    # derived from the full cost of attendance (including tuition and fees, books and supplies, and living expenses) minus federal, state, and institutional grant/scholarship aid, for full-time, first-time undergraduate Title IV-receiving students
# UGDS (number of undergrads enrolled in the fall)
# C100_4 (completion rate within 4 yr)
# aid?

df = pd.DataFrame()
line_count = 0
with open('colleges.txt', 'r') as colleges:
    lines = colleges.readlines()
    for line in lines:
        line = line.rstrip()
        line = line.replace(', ', '-') if ', ' in line else line
        found = desired[desired['INSTNM'] == line]
        if not found.empty:
            line_count += 1
            df = df.append(found)
            
df.to_csv('filtered_colleges.csv')