# Lombok Fix Instructions

## Problem

The Lombok annotations (`@Data`, `@Getter`, `@Setter`, etc.) are not being processed during compilation, causing "cannot find symbol" errors for getter and setter methods.

## Solution

You have two options:

### Option 1: Enable Lombok Annotation Processing (Recommended)

Add the following to `backend/pom.xml` in the `<build><plugins>` section:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.30</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

Then run:
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

### Option 2: Remove Lombok and Add Manual Getters/Setters

I've already started this process for the DTO classes. You need to do the same for all entity classes.

#### Files Already Fixed:
- ✅ `backend/src/main/java/com/banking/dto/LoginRequest.java`
- ✅ `backend/src/main/java/com/banking/dto/AuthResponse.java`

#### Files That Need Fixing:

1. **backend/src/main/java/com/banking/entity/User.java**
2. **backend/src/main/java/com/banking/entity/Transaction.java**
3. **backend/src/main/java/com/banking/entity/LoginFeatures.java**
4. **backend/src/main/java/com/banking/entity/MFAFeatures.java**
5. **backend/src/main/java/com/banking/entity/Anomaly.java**

For each file:
1. Remove the Lombok imports:
   ```java
   import lombok.AllArgsConstructor;
   import lombok.Data;
   import lombok.NoArgsConstructor;
   ```

2. Remove the Lombok annotations:
   ```java
   @Data
   @NoArgsConstructor
   @AllArgsConstructor
   ```

3. Add constructors and getters/setters for all fields

### Option 3: Use IDE to Generate Getters/Setters

If you're using IntelliJ IDEA or Eclipse:

1. Open each entity file
2. Right-click in the class
3. Select "Generate" → "Getters and Setters"
4. Select all fields
5. Generate

## Quick Fix Script

I've created a Python script to help you generate getters and setters. Save this as `generate_getters_setters.py`:

```python
#!/usr/bin/env python3
import re

def generate_getter_setter(field_type, field_name):
    # Convert field_name to camelCase for method names
    method_name = field_name[0].upper() + field_name[1:]
    
    getter = f"""
    public {field_type} get{method_name}() {{
        return {field_name};
    }}"""
    
    setter = f"""
    public void set{method_name}({field_type} {field_name}) {{
        this.{field_name} = {field_name};
    }}"""
    
    return getter + "\n" + setter

# Example usage:
# For a field: private String userId;
# Call: generate_getter_setter("String", "userId")
```

## Verification

After fixing, verify the build works:

```bash
cd backend
mvn clean compile
```

You should see "BUILD SUCCESS" with no compilation errors.

## Current Status

- ✅ Database setup complete
- ✅ Frontend API service created
- ✅ SignUpForm updated to use backend API
- ✅ SignIn updated to use backend API
- ⚠️ Backend compilation failing due to Lombok issue
- ⏳ Need to fix Lombok or add manual getters/setters

## Next Steps

1. Choose one of the options above to fix Lombok
2. Run `mvn clean install -DskipTests`
3. Start the backend: `mvn spring-boot:run`
4. Start the frontend: `cd proj && npm run dev`
5. Test signup and signin functionality
6. Verify data is stored in PostgreSQL database

## Testing After Fix

Once the backend is running:

1. Open browser to http://localhost:5173
2. Click "Sign Up"
3. Fill in all required fields
4. Submit the form
5. Check if you're redirected to sign in
6. Verify in database:
   ```sql
   psql -d banking_db
   SELECT * FROM users;
   ```
7. Sign in with your credentials
8. Verify login features are stored:
   ```sql
   SELECT * FROM login_features;
   SELECT * FROM mfa_features;
   ```

## Support

If you continue to have issues:

1. Check Java version: `java -version` (should be 17+)
2. Check Maven version: `mvn -version` (should be 3.6+)
3. Clear Maven cache: `rm -rf ~/.m2/repository/org/projectlombok`
4. Try rebuilding: `mvn clean install -U -DskipTests`

