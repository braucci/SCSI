import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Costanti atmosfera standard
T0 = 288.15        # K
p0 = 101325        # Pa
L = 0.0065         # K/m
R = 8.31432        # J/(mol K)
M = 0.0289644      # kg/mol
g = 9.80665        # m/s^2

# Densità al livello del mare
rho0 = p0 * M / (R * T0)

# Parametri
z = np.arange(0, 5001, 100)  # quota da 0 a 5000 m step 100 m
v0 = 25  # velocità di riferimento (ad esempio 25 km/h)



# Calcolo densità alle varie quote
T = T0 - L * z
p = p0 * (1 - L*z/T0) ** (g*M/(R*L))
rho = p * M / (R * T)

# Calcolo delta, fattore e velocità
delta = rho / rho0
inv_sqrt_delta = 1/np.sqrt(delta)
v = v0 * inv_sqrt_delta

# Tabella con pandas
df = pd.DataFrame({
    "Quota z [m]": z,
    "1/sqrt(delta)": inv_sqrt_delta,
    "v(z) [m/s]": v
})

print(df.to_string(index=False))

# Grafico
plt.figure(figsize=(8,5))
plt.plot(z, v, label="v(z)")
plt.xlabel("Quota z [m]")
plt.ylabel("Velocità v(z) [m/s]")
plt.title("Velocità in funzione della quota")
plt.grid(True)
plt.legend()
plt.show()